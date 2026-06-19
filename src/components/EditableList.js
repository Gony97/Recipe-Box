import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, fonts } from '../theme';
import { dirStyle } from '../utils/rtl';

export default function EditableList({
  title,
  items,
  onChange,
  accent = colors.accentDeep,
  numbered = false,
  moveLabel,
  onMove,
  placeholder = 'Type here…',
}) {
  const update = (i, value) => {
    const next = items.slice();
    next[i] = value;
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{items.length}</Text>
      </View>

      {items.length === 0 ? (
        <Text style={styles.empty}>Nothing yet — tap “Add” below.</Text>
      ) : null}

      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          {numbered ? (
            <View style={[styles.num, { backgroundColor: accent }]}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
          ) : (
            <View style={[styles.bullet, { backgroundColor: accent }]} />
          )}
          <TextInput
            value={item}
            onChangeText={(t) => update(i, t)}
            placeholder={placeholder}
            placeholderTextColor={colors.inkSoft}
            multiline
            style={[styles.input, dirStyle(item)]}
          />
          <View style={styles.rowActions}>
            {onMove ? (
              <Pressable onPress={() => onMove(i)} hitSlop={8} style={styles.moveBtn}>
                <Text style={[styles.moveText, { color: accent }]}>{moveLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => remove(i)} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={colors.inkSoft} />
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable onPress={add} style={[styles.addBtn, { borderColor: accent }]}>
        <Ionicons name="add" size={18} color={accent} />
        <Text style={[styles.addText, { color: accent }]}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: space.sm },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: space.sm },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, flex: 1, fontFamily: fonts.heading },
  count: { fontSize: 14, fontWeight: '700', color: colors.inkSoft },
  empty: { color: colors.inkSoft, fontStyle: 'italic', marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.sm,
    marginBottom: space.sm,
  },
  bullet: { width: 9, height: 9, borderRadius: 5, marginTop: 9, marginRight: space.sm },
  num: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', marginRight: space.sm, marginTop: 1,
  },
  numText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 2, minHeight: 24, fontFamily: fonts.body },
  rowActions: { alignItems: 'flex-end', marginLeft: space.xs },
  moveBtn: { marginBottom: 4 },
  moveText: { fontSize: 12, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: space.md, paddingVertical: space.sm,
    borderRadius: radius.pill, borderWidth: 1.5, borderStyle: 'dashed',
  },
  addText: { fontSize: 14, fontWeight: '700', marginLeft: 4 },
});
