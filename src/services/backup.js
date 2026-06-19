import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllRecipes } from '../db/database';

// Save a screenshot into the app's own storage so it persists with the recipe.
export async function persistImage(uri) {
  if (!uri) return null;
  try {
    const dir = FileSystem.documentDirectory + 'images/';
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
    const ext = (uri.split('.').pop() || 'jpg').split('?')[0].slice(0, 4);
    const dest = `${dir}${Date.now()}.${ext}`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  } catch {
    return uri; // fall back to the original uri if copying fails
  }
}

export async function exportBackup() {
  const recipes = await getAllRecipes();
  const payload = {
    app: 'Recipe Box',
    version: 1,
    exportedAt: new Date().toISOString(),
    count: recipes.length,
    recipes,
  };
  const path = FileSystem.documentDirectory + 'recipe-box-backup.json';
  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Save your Recipe Box backup',
    });
  }
  return { path, count: recipes.length };
}
