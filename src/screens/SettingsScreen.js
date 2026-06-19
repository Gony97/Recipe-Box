import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space, radius, shadow, fonts } from '../theme';
import { getApiKey, setApiKey } from '../services/keyStore';
import { exportBackup } from '../services/backup';

export default function SettingsScreen() {
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => setKey(await getApiKey()))();
  }, []);

  const save = async () => {
    await setApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const doExport = async () => {
    try {
      const { count } = await exportBackup();
      if (count === 0) Alert.alert('Nothing to export', 'Add a recipe first.');
    } catch (e) {
      Alert.alert('Export failed', e.message || String(e));
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: space.lg }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gemini API key</Text>
        <Text style={styles.help}>
          Recipe Box uses Google’s free Gemini tier to read screenshots and links.
          Paste your key below — it’s stored only on this device.
        </Text>
        <View style={styles.keyRow}>
          <TextInput
            value={key}
            onChangeText={setKey}
            placeholder="AIza…"
            placeholderTextColor={colors.inkSoft}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Pressable onPress={() => setShow((v) => !v)} hitSlop={8} style={styles.eye}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.inkSoft} />
          </Pressable>
        </View>
        <Pressable style={styles.saveBtn} onPress={save}>
          <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={18} color={colors.white} />
          <Text style={styles.saveText}>{saved ? 'Saved' : 'Save key'}</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
          <Text style={styles.link}>Get a free key at Google AI Studio →</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backup</Text>
        <Text style={styles.help}>
          Export all your recipes to a JSON file you can save or share. Keep a copy
          somewhere safe so you never lose your collection.
        </Text>
        <Pressable style={styles.exportBtn} onPress={doExport}>
          <Ionicons name="download-outline" size={18} color={colors.accentDeep} />
          <Text style={styles.exportText}>Export recipes</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>Recipe Box · v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg, padding: space.lg,
    marginBottom: space.md, ...shadow,
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: colors.ink, marginBottom: space.xs, fontFamily: fonts.heading },
  help: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: space.md, fontFamily: fonts.body },
  keyRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line,
    paddingRight: space.md, marginBottom: space.md,
  },
  input: { flex: 1, padding: space.md, fontSize: 15, color: colors.ink, fontFamily: fonts.body },
  eye: { padding: 4 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accentDeep, borderRadius: radius.pill, padding: space.md,
  },
  saveText: { color: colors.white, fontWeight: '700', marginLeft: 6, fontSize: 15, fontFamily: fonts.heading },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.tint, borderRadius: radius.pill, padding: space.md,
  },
  exportText: { color: colors.accentDeep, fontWeight: '700', marginLeft: 6, fontSize: 15, fontFamily: fonts.heading },
  link: { color: colors.accentDeep, fontWeight: '700', marginTop: space.md, textAlign: 'center', fontFamily: fonts.body },
  version: { color: colors.inkSoft, textAlign: 'center', marginTop: space.md, fontFamily: fonts.body },
});
