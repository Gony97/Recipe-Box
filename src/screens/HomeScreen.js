import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, fonts, shadow } from '../theme';
import BigButton from '../components/BigButton';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>Your kitchen, organized</Text>
          <Text style={styles.title}>Recipe Box</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsBtn}
          hitSlop={10}
        >
          <Ionicons name="settings-outline" size={21} color={colors.accentDeep} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="restaurant-outline" size={26} color={colors.accentDeep} />
        </View>
        <Text style={styles.heroText}>
          Snap a screenshot or paste a link — your recipes, gathered in one calm place.
        </Text>
      </View>

      <BigButton
        label="View recipes"
        sublabel="Browse by category"
        icon="book-outline"
        tint="#A7DCC9"
        deep={colors.mintDeep}
        onPress={() => navigation.navigate('Categories')}
      />
      <BigButton
        label="Add a recipe"
        sublabel="From a screenshot or a blog link"
        icon="add-circle-outline"
        tint="#F4C2D8"
        deep={colors.blushDeep}
        onPress={() => navigation.navigate('Add')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingTop: space.xl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  kicker: { color: colors.inkSoft, fontSize: 14, fontWeight: '600', fontFamily: fonts.body },
  title: { color: colors.ink, fontSize: 36, fontWeight: '700', letterSpacing: 0.2, fontFamily: fonts.heading },
  settingsBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  hero: {
    backgroundColor: colors.tint,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: space.sm,
  },
  heroText: {
    color: colors.ink,
    fontSize: 15.5,
    textAlign: 'center',
    lineHeight: 23,
    fontFamily: fonts.body,
  },
});
