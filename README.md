# Recipe Box 🍳

A fun, colorful recipe keeper for Android. Add recipes from a **screenshot**
(Hebrew or English) or a **blog link**, and Google's **Gemini** turns them into
clean ingredients and steps. Browse by colorful categories, edit anything,
and back everything up.

Built with **Expo / React Native** + **SQLite** (on-device) + **Gemini** (free tier).

---

## What you need first

1. **Node.js 18+** on the machine you'll develop on (`node --version`).
2. The **Expo Go** app on your Android phone (from the Play Store) — for live testing.
3. A **free Gemini API key** — get one at <https://aistudio.google.com/app/apikey>
   (sign in with Google, "Create API key", copy it). No credit card needed.

---

## Run it (development)

```bash
cd recipe-box
npm install
# if anything complains about versions:
npx expo install --fix

npx expo start
```

Scan the QR code with **Expo Go** on your phone. The app loads live, and every
save reloads instantly while you work.

First thing in the app: open **Settings** (gear icon, top right of the home
screen) and paste your Gemini API key. It's stored only on your device.

---

## Build a real installable APK (no computer-side Android tools needed)

This uses Expo's **cloud** build, so you don't need Android Studio, the SDK, or
Gradle locally — and it works even when driving it from Termux.

```bash
npm install -g eas-cli
eas login                       # create/log in to a free Expo account
eas build -p android --profile preview
```

Expo builds it on their servers and gives you a link to download the **.apk**.
Open that link on your phone and install it (you may need to allow
"install from unknown sources"). Done — Recipe Box is now a real app with its
own icon.

> Note: use the command above, **not** `--local`. A local Android build needs
> the full Android toolchain and won't run inside Termux on a phone.

---

## How it works

- **Screenshot → recipe:** the image is sent to Gemini's vision model, which
  reads it (Hebrew or English, no translation) and returns a structured recipe.
- **Link → recipe:** the page is fetched and checked for `schema.org/Recipe`
  data (free, no API call). If it's missing, the page text is sent to Gemini.
- **Review & edit:** nothing saves automatically — you fix any mistakes, move
  lines between ingredients/steps, set the category, then save.
- **Storage:** everything lives in an on-device SQLite database. Use
  **Settings → Export recipes** to save a JSON backup.

## Project layout

```
App.js                  navigation + database init
src/theme.js            colors, category styles, spacing
src/db/database.js      SQLite (recipes + categories)
src/services/
  gemini.js             screenshot/text → structured recipe
  scraper.js            URL → schema.org Recipe (+ html fallback)
  keyStore.js           secure storage for the API key
  backup.js             image persistence + JSON export
src/components/         BigButton, Pill, EditableList
src/screens/            Home, Categories, RecipeList, RecipeDetail,
                        Add, Edit, Settings
```

## Free Gemini tier — what to expect

Plenty for personal use: roughly **1,500 requests/day** on the Flash models,
and one recipe = one request. The only trade-off is that on the free tier
Google may use submitted content to improve their models; enabling billing
turns that off and costs pennies. Limits can change — check Google AI Studio.

## Troubleshooting

- **"Add your Gemini API key in Settings first."** → paste your key in Settings.
- **Version/dependency errors on install** → run `npx expo install --fix`.
- **A blog link imports nothing** → some sites block scraping; try a screenshot
  of the recipe instead.
