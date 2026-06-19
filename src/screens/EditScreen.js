import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { colors, space, radius, shadow, fonts } from '../theme';
import { dirStyle } from '../utils/rtl';
import Pill from '../components/Pill';
import EditableList from '../components/EditableList';
import {
  getRecipe, insertRecipe, updateRecipe, getCategories, addCategory,
} from '../db/database';
import { getApiKey } from '../services/keyStore';
import { extractFromImage } from '../services/gemini';

export default function EditScreen({ route, navigation }) {
  const editingId = route.params?.id || null;
  const incoming = route.params?.draft || null;

  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  const [r, setR] = useState({
    title: '', category: 'Other', servings: '', prepTime: '', cookTime: '',
    ingredients: [], steps: [], imageUri: null, sourceType: '', sourceRef: '',
  });

  useEffect(() => {
    (async () => {
      const cats = await getCategories();
      setCategories(cats);
      if (editingId) {
        const existing = await getRecipe(editingId);
        if (existing) setR(existing);
      } else if (incoming) {
        setR((prev) => ({
          ...prev,
          ...incoming,
          category: incoming.category && cats.includes(incoming.category)
            ? incoming.category
            : (incoming.category || 'Other'),
        }));
      }
      setLoaded(true);
    })();
  }, []);

  const set = (patch) => setR((prev) => ({ ...prev, ...patch }));

  const moveIngredientToSteps = (i) => {
    const item = r.ingredients[i];
    set({
      ingredients: r.ingredients.filter((_, idx) => idx !== i),
      steps: [...r.steps, item],
    });
  };
  const moveStepToIngredients = (i) => {
    const item = r.steps[i];
    set({
      steps: r.steps.filter((_, idx) => idx !== i),
      ingredients: [...r.ingredients, item],
    });
  };

  const handleAddCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    await addCategory(name);
    setCategories(await getCategories());
    set({ category: name });
    setNewCat('');
    setShowNewCat(false);
  };

  const improveWithAI = async () => {
    if (!r.imageUri) {
      Alert.alert('No image', 'AI re-read is available for screenshot recipes.');
      return;
    }
    try {
      setBusy('Re-reading with Gemini…');
      const base64 = await FileSystem.readAsStringAsync(r.imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const apiKey = await getApiKey();
      const fresh = await extractFromImage(apiKey, base64, 'image/jpeg', categories);
      set({
        title: fresh.title || r.title,
        servings: fresh.servings || r.servings,
        prepTime: fresh.prepTime || r.prepTime,
        cookTime: fresh.cookTime || r.cookTime,
        ingredients: fresh.ingredients.length ? fresh.ingredients : r.ingredients,
        steps: fresh.steps.length ? fresh.steps : r.steps,
      });
    } catch (e) {
      Alert.alert('AI re-read failed', e.message || String(e));
    } finally {
      setBusy('');
    }
  };

  const save = async () => {
    if (!r.title.trim()) {
      Alert.alert('Add a title', 'Give your recipe a name first.');
      return;
    }
    const clean = {
      ...r,
      title: r.title.trim(),
      ingredients: r.ingredients.map((s) => s.trim()).filter(Boolean),
      steps: r.steps.map((s) => s.trim()).filter(Boolean),
    };
    if (editingId) {
      await updateRecipe(editingId, clean);
      navigation.goBack();
    } else {
      const id = await insertRecipe(clean);
      navigation.replace('RecipeDetail', { id });
    }
  };

  if (!loaded || busy) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        {busy ? <Text style={styles.busy}>{busy}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {r.imageUri ? (
        <Image source={{ uri: r.imageUri }} style={styles.preview} resizeMode="cover" />
      ) : null}

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={r.title}
        onChangeText={(t) => set({ title: t })}
        placeholder="Recipe name"
        placeholderTextColor={colors.inkSoft}
        style={[styles.titleInput, dirStyle(r.title)]}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pills}>
        {categories.map((c) => (
          <Pill key={c} label={c} selected={r.category === c} onPress={() => set({ category: c })} />
        ))}
        <Pressable style={styles.newCatBtn} onPress={() => setShowNewCat((v) => !v)}>
          <Ionicons name="add" size={16} color={colors.accentDeep} />
          <Text style={styles.newCatText}>New</Text>
        </Pressable>
      </View>
      {showNewCat ? (
        <View style={styles.newCatRow}>
          <TextInput
            value={newCat}
            onChangeText={setNewCat}
            placeholder="New category name"
            placeholderTextColor={colors.inkSoft}
            style={[styles.smallInput, { flex: 1 }]}
          />
          <Pressable style={styles.addCatBtn} onPress={handleAddCategory}>
            <Text style={styles.addCatText}>Add</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <MetaInput label="Servings" value={r.servings} onChange={(t) => set({ servings: t })} />
        <MetaInput label="Prep" value={r.prepTime} onChange={(t) => set({ prepTime: t })} />
        <MetaInput label="Cook" value={r.cookTime} onChange={(t) => set({ cookTime: t })} />
      </View>

      {r.imageUri ? (
        <Pressable style={styles.aiBtn} onPress={improveWithAI}>
          <Ionicons name="sparkles-outline" size={16} color={colors.accentDeep} />
          <Text style={styles.aiText}>Improve with AI</Text>
        </Pressable>
      ) : null}

      <EditableList
        title="Ingredients"
        items={r.ingredients}
        onChange={(v) => set({ ingredients: v })}
        accent={colors.mintDeep}
        moveLabel="→ Steps"
        onMove={moveIngredientToSteps}
        placeholder="e.g. 2 cups flour"
      />
      <EditableList
        title="Steps"
        items={r.steps}
        onChange={(v) => set({ steps: v })}
        accent={colors.accentDeep}
        numbered
        moveLabel="→ Ingredients"
        onMove={moveStepToIngredients}
        placeholder="Describe the step"
      />

      <Pressable style={styles.saveBtn} onPress={save}>
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
        <Text style={styles.saveText}>{editingId ? 'Save changes' : 'Save recipe'}</Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MetaInput({ label, value, onChange }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="—"
        placeholderTextColor={colors.inkSoft}
        style={styles.smallInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg },
  center: { alignItems: 'center', justifyContent: 'center' },
  busy: { marginTop: space.md, color: colors.ink, fontSize: 16, fontWeight: '600', fontFamily: fonts.body },
  preview: { width: '100%', height: 190, borderRadius: radius.lg, marginBottom: space.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.inkSoft, marginBottom: space.xs, marginTop: space.sm, fontFamily: fonts.body },
  titleInput: {
    backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
    padding: space.md, fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: space.sm,
    fontFamily: fonts.heading,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.sm },
  newCatBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: space.md, paddingVertical: space.sm,
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line,
    borderStyle: 'dashed', marginBottom: space.sm,
  },
  newCatText: { fontWeight: '700', color: colors.accentDeep, marginLeft: 2 },
  newCatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  addCatBtn: {
    backgroundColor: colors.accentDeep, borderRadius: radius.sm,
    paddingHorizontal: space.md, paddingVertical: space.sm, marginLeft: space.sm,
  },
  addCatText: { color: colors.white, fontWeight: '700' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: space.md },
  meta: { flex: 1, marginRight: space.sm },
  metaLabel: { fontSize: 12, fontWeight: '700', color: colors.inkSoft, marginBottom: 4, fontFamily: fonts.body },
  smallInput: {
    backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line,
    padding: space.sm, fontSize: 15, color: colors.ink, fontFamily: fonts.body,
  },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: colors.tint, borderRadius: radius.pill,
    paddingHorizontal: space.md, paddingVertical: space.sm, marginBottom: space.lg,
  },
  aiText: { color: colors.accentDeep, fontWeight: '700', marginLeft: 5 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accentDeep, borderRadius: radius.pill, padding: space.md, ...shadow,
  },
  saveText: { color: colors.white, fontSize: 17, fontWeight: '700', marginLeft: space.sm, fontFamily: fonts.heading },
});
