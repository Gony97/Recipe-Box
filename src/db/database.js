import * as SQLite from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '../utils/categories';

let dbPromise = null;

function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('recipebox.db');
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      steps TEXT NOT NULL,
      servings TEXT,
      prep_time TEXT,
      cook_time TEXT,
      image_uri TEXT,
      source_type TEXT,
      source_ref TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY NOT NULL
    );
  `);

  // Seed default categories once.
  const row = await db.getFirstAsync('SELECT COUNT(*) AS n FROM categories');
  if (!row || row.n === 0) {
    for (const name of DEFAULT_CATEGORIES) {
      await db.runAsync('INSERT OR IGNORE INTO categories (name) VALUES (?)', name);
    }
  }
}

// --- Categories ---
export async function getCategories() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT name FROM categories ORDER BY name COLLATE NOCASE');
  return rows.map((r) => r.name);
}

export async function addCategory(name) {
  const db = await getDb();
  const clean = (name || '').trim();
  if (!clean) return;
  await db.runAsync('INSERT OR IGNORE INTO categories (name) VALUES (?)', clean);
}

export async function countByCategory() {
  const db = await getDb();
  const rows = await db.getAllAsync(
    'SELECT category, COUNT(*) AS n FROM recipes GROUP BY category'
  );
  const map = {};
  for (const r of rows) map[r.category] = r.n;
  return map;
}

// --- Recipes ---
function rowToRecipe(r) {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    ingredients: safeParse(r.ingredients),
    steps: safeParse(r.steps),
    servings: r.servings || '',
    prepTime: r.prep_time || '',
    cookTime: r.cook_time || '',
    imageUri: r.image_uri || null,
    sourceType: r.source_type || '',
    sourceRef: r.source_ref || '',
    createdAt: r.created_at,
  };
}

function safeParse(text) {
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function getRecipesByCategory(category) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    'SELECT * FROM recipes WHERE category = ? ORDER BY created_at DESC',
    category
  );
  return rows.map(rowToRecipe);
}

export async function getAllRecipes() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT * FROM recipes ORDER BY created_at DESC');
  return rows.map(rowToRecipe);
}

export async function getRecipe(id) {
  const db = await getDb();
  const r = await db.getFirstAsync('SELECT * FROM recipes WHERE id = ?', id);
  return r ? rowToRecipe(r) : null;
}

export async function insertRecipe(recipe) {
  const db = await getDb();
  const res = await db.runAsync(
    `INSERT INTO recipes
       (title, category, ingredients, steps, servings, prep_time, cook_time,
        image_uri, source_type, source_ref, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    recipe.title,
    recipe.category,
    JSON.stringify(recipe.ingredients || []),
    JSON.stringify(recipe.steps || []),
    recipe.servings || '',
    recipe.prepTime || '',
    recipe.cookTime || '',
    recipe.imageUri || null,
    recipe.sourceType || '',
    recipe.sourceRef || '',
    Date.now()
  );
  // Make sure the category exists in the list.
  await addCategory(recipe.category);
  return res.lastInsertRowId;
}

export async function updateRecipe(id, recipe) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE recipes SET
       title = ?, category = ?, ingredients = ?, steps = ?,
       servings = ?, prep_time = ?, cook_time = ?, image_uri = ?
     WHERE id = ?`,
    recipe.title,
    recipe.category,
    JSON.stringify(recipe.ingredients || []),
    JSON.stringify(recipe.steps || []),
    recipe.servings || '',
    recipe.prepTime || '',
    recipe.cookTime || '',
    recipe.imageUri || null,
    id
  );
  await addCategory(recipe.category);
}

export async function deleteRecipe(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', id);
}
