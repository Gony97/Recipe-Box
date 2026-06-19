import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, space, radius, shadow, fonts, styleForCategory } from '../theme';
import { dirStyle } from '../utils/rtl';
import { getRecipesByCategory } from '../db/database';

export default function RecipeListScreen({ route, navigation }) {
  const { category } = route.params;
  const [recipes, setRecipes] = useState([]);
  const { color, deep } = styleForCategory(category);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const data = await getRecipesByCategory(category);
        if (active) setRecipes(data);
      })();
      return () => { active = false; };
    }, [category])
  );

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}
    >
      <View style={[styles.stripe, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, dirStyle(item.title)]} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.ingredients.length} ingredients · {item.steps.length} steps
          {item.servings ? ` · ${item.servings}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: space.lg }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIcon, { backgroundColor: color }]}>
              <Ionicons name="restaurant-outline" size={32} color={deep} />
            </View>
            <Text style={styles.empty}>No recipes here yet.</Text>
            <Pressable style={[styles.addBtn, { backgroundColor: colors.accentDeep }]} onPress={() => navigation.navigate('Add')}>
              <Text style={styles.addText}>Add one</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
    ...shadow,
  },
  stripe: { width: 6, alignSelf: 'stretch', borderRadius: 3, marginRight: space.md },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink, fontFamily: fonts.heading },
  meta: { fontSize: 13, color: colors.inkSoft, marginTop: 3, fontFamily: fonts.body },
  emptyWrap: { alignItems: 'center', marginTop: space.xl * 2 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center',
    marginBottom: space.md,
  },
  empty: { color: colors.inkSoft, fontSize: 16, marginBottom: space.lg, fontFamily: fonts.body },
  addBtn: {
    borderRadius: radius.pill,
    paddingHorizontal: space.lg, paddingVertical: space.sm,
  },
  addText: { color: colors.white, fontWeight: '700', fontFamily: fonts.body },
});
