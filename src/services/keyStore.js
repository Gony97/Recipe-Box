import * as SecureStore from 'expo-secure-store';

const KEY = 'gemini_api_key';

export async function getApiKey() {
  try {
    return (await SecureStore.getItemAsync(KEY)) || '';
  } catch {
    return '';
  }
}

export async function setApiKey(value) {
  const clean = (value || '').trim();
  if (!clean) {
    await SecureStore.deleteItemAsync(KEY);
  } else {
    await SecureStore.setItemAsync(KEY, clean);
  }
}
