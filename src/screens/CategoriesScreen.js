import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, space, radius, shadow, fonts, styleForCategory } from '../theme';
import { getCategories, countByCategory } from '../db/database';

export default function CategoriesScreen({ navigation }) {
  const [cats, setCats] = useState([]);
  const [counts, setCounts] = useState({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [c, n] = await Promise.all([getCategories(), countByCategory()]);
        if (active) { setCats(c); setCounts(n); }
      })();
      return () => { active = false; };
    }, [])
  );

  const renderItem = ({ item }) => {
    const { color, deep, icon } = styleForCategory(item);
    const n = counts[item] || 0;
    return (
      <Pressable
        style={[styles.tile, { backgroundColor: color }]}
        onPress={() => navigation.navigate('RecipeList', { category: item })}
      >
        <View style={styles.iconChip}>
          <Ionicons name={icon} size={22} color={deep} />
        </View>
        <Text style={[styles.tileName, { color: deep }]}>{item}</Text>
        <Text style={[styles.tileCount, { color: deep }]}>
          {n} {n === 1 ? 'recipe' : 'recipes'}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={cats}
        keyExtractor={(item) => item}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: space.md }}
        contentContainerStyle={{ padding: space.lg, gap: space.md }}
        ListEmptyComponent={<Text style={styles.empty}>No categories yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    minHeight: 128,
    justifyContent: 'flex-end',
    ...shadow,
  },
  iconChip: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileName: { fontSize: 18, fontWeight: '700', fontFamily: fonts.heading },
  tileCount: { fontSize: 13, fontWeight: '600', marginTop: 2, opacity: 0.85, fontFamily: fonts.body },
  empty: { color: colors.inkSoft, textAlign: 'center', marginTop: space.xl },
});
