import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Pressable, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, space, radius, shadow, fonts, styleForCategory } from '../theme';
import { dirStyle } from '../utils/rtl';
import { getRecipe, deleteRecipe } from '../db/database';

export default function RecipeDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const data = await getRecipe(id);
        if (active) setRecipe(data);
      })();
      return () => { active = false; };
    }, [id])
  );

  const confirmDelete = () => {
    Alert.alert('Delete recipe', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(id);
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <Pressable onPress={() => navigation.navigate('Edit', { id })} hitSlop={8} style={{ marginRight: 18 }}>
            <Ionicons name="create-outline" size={23} color={colors.accentDeep} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, id]);

  if (!recipe) {
    return <View style={[styles.screen, { padding: space.lg }]}><Text style={styles.muted}>Loading…</Text></View>;
  }

  const cat = styleForCategory(recipe.category);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: space.lg }}>
      {recipe.imageUri ? (
        <Image source={{ uri: recipe.imageUri }} style={styles.image} resizeMode="cover" />
      ) : null}

      <View style={[styles.catTag, { backgroundColor: cat.color }]}>
        <Ionicons name={cat.icon} size={14} color={cat.deep} />
        <Text style={[styles.catText, { color: cat.deep }]}>{recipe.category}</Text>
      </View>

      <Text style={[styles.title, dirStyle(recipe.title)]}>{recipe.title}</Text>

      {(recipe.servings || recipe.prepTime || recipe.cookTime) ? (
        <View style={styles.metaRow}>
          {recipe.servings ? <Meta icon="people-outline" text={recipe.servings} /> : null}
          {recipe.prepTime ? <Meta icon="time-outline" text={`Prep ${recipe.prepTime}`} /> : null}
          {recipe.cookTime ? <Meta icon="flame-outline" text={`Cook ${recipe.cookTime}`} /> : null}
        </View>
      ) : null}

      <Section title="Ingredients" color={cat.deep}>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={styles.ingRow}>
            <View style={[styles.bullet, { backgroundColor: cat.color }]} />
            <Text style={[styles.ingText, dirStyle(ing)]}>{ing}</Text>
          </View>
        ))}
      </Section>

      <Section title="Steps" color={cat.deep}>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.stepNum, { backgroundColor: cat.deep }]}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepText, dirStyle(step)]}>{step}</Text>
          </View>
        ))}
      </Section>

      {recipe.sourceType === 'url' && recipe.sourceRef ? (
        <Text style={styles.source} numberOfLines={1}>From: {recipe.sourceRef}</Text>
      ) : null}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={colors.inkSoft} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function Section({ title, color, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  muted: { color: colors.inkSoft },
  image: { width: '100%', height: 210, borderRadius: radius.lg, marginBottom: space.md },
  catTag: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: space.md, paddingVertical: 7, borderRadius: radius.pill, marginBottom: space.sm,
  },
  catText: { fontWeight: '700', marginLeft: 5, fontSize: 13, fontFamily: fonts.body },
  title: { fontSize: 27, fontWeight: '700', color: colors.ink, marginBottom: space.md, fontFamily: fonts.heading },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: space.md },
  meta: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 7,
    marginRight: space.sm, marginBottom: space.sm, ...shadow,
  },
  metaText: { color: colors.ink, fontWeight: '600', marginLeft: 5, fontSize: 13, fontFamily: fonts.body },
  section: {
    backgroundColor: colors.white, borderRadius: radius.lg, padding: space.lg,
    marginBottom: space.md, ...shadow,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md },
  sectionDot: { width: 12, height: 12, borderRadius: 6, marginRight: space.sm },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.ink, fontFamily: fonts.heading },
  ingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.sm },
  bullet: { width: 9, height: 9, borderRadius: 5, marginTop: 8, marginRight: space.md },
  ingText: { flex: 1, fontSize: 16, color: colors.ink, lineHeight: 22, fontFamily: fonts.body },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.md },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    marginRight: space.md, marginTop: 1,
  },
  stepNumText: { color: colors.white, fontWeight: '700', fontSize: 13, fontFamily: fonts.body },
  stepText: { flex: 1, fontSize: 16, color: colors.ink, lineHeight: 23, fontFamily: fonts.body },
  source: { color: colors.inkSoft, fontSize: 12, marginTop: space.sm, fontFamily: fonts.body },
});
