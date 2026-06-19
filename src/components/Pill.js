import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, space, fonts, styleForCategory } from '../theme';

export default function Pill({ label, selected, onPress }) {
  const { color, deep } = styleForCategory(label);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        selected
          ? { backgroundColor: color, borderColor: color }
          : { backgroundColor: colors.white, borderColor: colors.line },
      ]}
    >
      <Text style={[styles.text, { color: selected ? deep : colors.inkSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    marginRight: space.sm,
    marginBottom: space.sm,
  },
  text: { fontSize: 14, fontWeight: '700', fontFamily: fonts.body },
});
