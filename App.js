import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, fonts } from './src/theme';
import { initDb } from './src/db/database';

import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import RecipeListScreen from './src/screens/RecipeListScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import AddScreen from './src/screens/AddScreen';
import EditScreen from './src/screens/EditScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.accentDeep },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerShadowVisible: false,
  headerTintColor: colors.accentDeep,
  headerTitleStyle: { fontWeight: '700', fontSize: 18, fontFamily: fonts.heading, color: colors.ink },
  contentStyle: { backgroundColor: colors.bg },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await initDb();
        setReady(true);
      } catch (e) {
        setError(e.message || String(e));
      }
    })();
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Couldn’t start the database:</Text>
        <Text style={styles.errMsg}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
          <Stack.Screen
            name="RecipeList"
            component={RecipeListScreen}
            options={({ route }) => ({ title: route.params?.category || 'Recipes' })}
          />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
          <Stack.Screen name="Add" component={AddScreen} options={{ title: 'Add a recipe' }} />
          <Stack.Screen name="Edit" component={EditScreen} options={{ title: 'Review & edit' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  err: { color: colors.ink, fontWeight: '700', fontSize: 16, marginBottom: 8, fontFamily: fonts.heading },
  errMsg: { color: colors.danger, textAlign: 'center', fontFamily: fonts.body },
});
