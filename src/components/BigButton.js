import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadow, fonts } from '../theme';

export default function BigButton({ label, sublabel, icon, tint = colors.tint, deep = colors.accentDeep, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={26} color={deep} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sub}>{sublabel}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg,
    borderRadius: radius.lg,
    marginBottom: space.md,
    backgroundColor: colors.card,
    ...shadow,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  label: { color: colors.ink, fontSize: 19, fontWeight: '700', fontFamily: fonts.heading },
  sub: { color: colors.inkSoft, fontSize: 13, marginTop: 3, fontFamily: fonts.body },
});
