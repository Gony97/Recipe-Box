import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, space, radius, shadow, fonts } from '../theme';
import { dirStyle } from '../utils/rtl';
import { getApiKey } from '../services/keyStore';
import { getCategories } from '../db/database';
import { extractFromImage, extractFromText } from '../services/gemini';
import { fetchPage, recipeFromJsonLd, htmlToText } from '../services/scraper';
import { persistImage } from '../services/backup';

export default function AddScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState('');

  const goEdit = (recipe, imageUri, sourceType, sourceRef) => {
    navigation.replace('Edit', {
      draft: { ...recipe, imageUri: imageUri || null, sourceType, sourceRef },
    });
  };

  const handleScreenshot = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo access to read a screenshot.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.6,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const apiKey = await getApiKey();
      const categories = await getCategories();

      setBusy('Reading your screenshot…');
      const recipe = await extractFromImage(
        apiKey, asset.base64, asset.mimeType || 'image/jpeg', categories
      );
      if (!recipe.title && recipe.ingredients.length === 0) {
        throw new Error("That image didn't look like a recipe. Try another screenshot.");
      }
      const saved = await persistImage(asset.uri);
      goEdit(recipe, saved, 'screenshot', '');
    } catch (e) {
      Alert.alert('Could not read it', e.message || String(e));
    } finally {
      setBusy('');
    }
  };

  const handleUrl = async () => {
    const link = url.trim();
    if (!/^https?:\/\//i.test(link)) {
      Alert.alert('Check the link', 'Please paste a full URL starting with http.');
      return;
    }
    try {
      setBusy('Fetching the page…');
      const html = await fetchPage(link);

      let recipe = recipeFromJsonLd(html);
      if (!recipe || (recipe.ingredients.length === 0 && recipe.steps.length === 0)) {
        setBusy('No structured recipe — asking Gemini…');
        const apiKey = await getApiKey();
        const categories = await getCategories();
        recipe = await extractFromText(apiKey, htmlToText(html), categories);
      }
      if (!recipe.title && recipe.ingredients.length === 0) {
        throw new Error("Couldn't find a recipe on that page.");
      }
      goEdit(recipe, null, 'url', link);
    } catch (e) {
      Alert.alert('Could not import', e.message || String(e));
    } finally {
      setBusy('');
    }
  };

  if (busy) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.busy}>{busy}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h}>How do you want to add it?</Text>

      <Pressable style={styles.method} onPress={handleScreenshot}>
        <View style={[styles.methodIcon, { backgroundColor: '#DEBEEA' }]}>
          <Ionicons name="image-outline" size={24} color="#9A5FB8" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.methodTitle}>From a screenshot</Text>
          <Text style={styles.methodSub}>Pick a photo — Gemini reads it (Hebrew or English).</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.inkSoft} />
      </Pressable>

      <View style={styles.method}>
        <View style={[styles.methodIcon, { backgroundColor: '#A7DCC9' }]}>
          <Ionicons name="link-outline" size={24} color={colors.mintDeep} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.methodTitle}>From a blog link</Text>
          <Text style={styles.methodSub}>Paste a recipe URL and we’ll pull it in.</Text>
        </View>
      </View>

      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="https://…"
        placeholderTextColor={colors.inkSoft}
        autoCapitalize="none"
        keyboardType="url"
        style={[styles.urlInput, dirStyle(url)]}
      />
      <Pressable
        style={[styles.importBtn, { opacity: url.trim() ? 1 : 0.5 }]}
        onPress={handleUrl}
        disabled={!url.trim()}
      >
        <Text style={styles.importText}>Import from link</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg },
  center: { alignItems: 'center', justifyContent: 'center' },
  busy: { marginTop: space.md, color: colors.ink, fontSize: 16, fontWeight: '600', fontFamily: fonts.body },
  h: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: space.lg, fontFamily: fonts.heading },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
    ...shadow,
  },
  methodIcon: {
    width: 50, height: 50, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: space.md,
  },
  methodTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, fontFamily: fonts.heading },
  methodSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2, fontFamily: fonts.body },
  urlInput: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    fontSize: 16,
    color: colors.ink,
    marginBottom: space.md,
    fontFamily: fonts.body,
  },
  importBtn: {
    backgroundColor: colors.accentDeep,
    borderRadius: radius.pill,
    padding: space.md,
    alignItems: 'center',
  },
  importText: { color: colors.white, fontSize: 16, fontWeight: '700', fontFamily: fonts.heading },
});
