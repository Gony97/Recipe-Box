

https://github.com/user-attachments/assets/b4112390-2740-45b4-8aa3-e23560b6bca9



https://github.com/user-attachments/assets/2ddc6b03-c752-44a0-9d74-44cdebebad4e



# Recipe Box 🍳

Recipe Box is a simple, colorful app for keeping all your recipes in one place.

Add a recipe two ways:

- **From a screenshot** — snap or upload a picture of a recipe (in **Hebrew or English**) and Google's Gemini AI reads it and splits it into clean ingredients and steps.
- **From a blog link** — paste a recipe URL and the app pulls the recipe in automatically.

Before anything is saved you get a **review screen** to fix mistakes, move lines between ingredients and steps, and choose a category. Then browse everything by colorful categories (Breakfast, Lunch, Dinner, Cakes, Desserts, and more), edit or delete any recipe, and export a backup whenever you like. Everything is stored privately on your own device.

Built with Expo / React Native, on-device SQLite, and the free tier of Google Gemini.

---

## Installation

There are three ways to use Recipe Box, depending on who you are:

1. **[Install the Android app (APK)](#option-1--install-the-android-app-apk)** — easiest for Android users.
2. **[Run it from a computer with Expo Go](#option-2--run-it-from-a-computer-with-expo-go)** — for trying it out, developing, or for iPhone users without a build.
3. **[For iPhone / iOS users](#option-3--for-iphone--ios-users)** — what it takes to run it on Apple devices.

**Every method needs a free Gemini API key** to read screenshots and links — see [Generating a Gemini API key](#generating-a-gemini-api-key). Browsing and viewing saved recipes work without it.

---

## Option 1 — Install the Android app (APK)

This is the easiest option. The APK is a complete, standalone app — it does **not** need a computer once installed.

> 📥 **Download link:** https://expo.dev/accounts/gonyidan/projects/recipe-box/builds/69c0c92f-f45b-4321-ad13-55f2f33aff57

### Walkthrough for Android users

1. Open the download link **on your Android phone** and download the `.apk` file.
2. Tap the downloaded file to start installing.
3. **If a "Google Play Protect — App blocked" message appears**, this is normal for any app not installed from the Play Store (it just means Google hasn't seen this app before — it is **not** a sign of a problem):
   - Tap **More details**.
   - Tap **Install anyway**.
4. **If tapping the file does nothing or warns about your browser**, allow installs from it once:
   - Go to **Settings → Apps → (your browser, e.g. Chrome) → Install unknown apps → Allow from this source**.
   - Then tap the `.apk` again.
5. Tap **Install**, then **Open**. Recipe Box now has its own icon and runs on its own.
6. Add your Gemini key — see [Generating a Gemini API key](#generating-a-gemini-api-key) below.

### Notes for sharing the APK

- The APK works on **Android only**. iPhones can't install it (see [Option 3](#option-3--for-iphone--ios-users)).
- Each person installs it the same way and enters **their own** Gemini key (stored privately on their phone, using their own free quota).
- Recipes are stored per-phone — they aren't shared between people.
- The app still needs **internet** to read screenshots and links (that's Gemini working in the cloud), but no longer needs a computer.

---

## Generating a Gemini API key

Recipe Box uses Google's **free** Gemini tier. No credit card required. This takes about two minutes and is needed no matter how you installed the app.

1. Go to **https://aistudio.google.com/app/apikey** (on your phone or computer).
2. Sign in with your Google account.
3. Accept the terms if prompted.
4. Click **Create API key** (choosing "Create API key in new project" is fine).
5. A long key starting with **`AIza…`** appears — click the **copy** icon. Treat it like a password; don't share it publicly.

Then in the app:

1. Open Recipe Box and tap the **gear icon** (top-right of the home screen) to open **Settings**.
2. Paste your key into the **Gemini API key** field.
3. Tap **Save key** (it briefly shows "Saved"). The key is stored only on your device.

To test it: tap **Add a recipe → From a screenshot**, pick any recipe image, and you should see "Reading your screenshot…" followed by the filled-in review screen.

**Free tier:** roughly 1,500 requests per day on the Flash models — one recipe is one request, so this is far more than enough for personal use. Limits can change; check Google AI Studio for current numbers.

---

## Option 2 — Run it from a computer with Expo Go

Use this to try the app, make changes, or run it on a phone (Android **or** iPhone) without building an APK. The app runs from your computer and streams to the **Expo Go** app on your phone — so your computer must stay on and on the **same Wi-Fi** as the phone.

### What you need

1. **Node.js (LTS)** on your computer — get it from <https://nodejs.org> or, on Windows: `winget install OpenJS.NodeJS.LTS`.
   After installing, **open a new terminal window** so it picks up Node. Verify with `node --version` and `npm --version`.
2. The **Expo Go** app on your phone (Play Store for Android, App Store for iPhone).
3. A free **Gemini API key** ([see above](#generating-a-gemini-api-key)).

### Steps

```bash
cd recipe-box
npm install
npx expo start
```

- A **QR code** appears in the terminal.
- **Android:** open Expo Go and scan the QR code.
- **iPhone:** open the **Camera** app, point it at the QR code, and tap the banner to open it in Expo Go.

In the app, open **Settings** and paste your Gemini key.

> **Important — match the SDK to your phone's Expo Go.** If you see *"Project is incompatible with this version of Expo Go,"* your phone's Expo Go is a newer SDK than the project. Upgrade the project to match (replace 54 with the version Expo Go reports):
> ```bash
> npm install expo@^54.0.0
> npx expo install --fix
> npx expo start -c
> ```

### Troubleshooting (Expo Go path)

- **`npm` / `npx` / `node` not recognized** — Node isn't installed, or the terminal hasn't picked up the PATH. Open a **fresh terminal**. On Windows, you can also reload PATH in the current window:
  ```powershell
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  ```
- **`Cannot find module 'X'` (e.g. `expo-asset`, `babel-preset-expo`)** — install it and restart with a cleared cache:
  ```bash
  npx expo install expo-asset
  npm install --save-dev babel-preset-expo
  npx expo start -c
  ```
- **A red error screen, or anything that "works in Expo Go but not in a build"** — usually mismatched package versions. The reliable cure is a clean realign to one SDK:
  ```bash
  Remove-Item -Recurse -Force node_modules    # macOS/Linux: rm -rf node_modules
  Remove-Item -Force package-lock.json         # macOS/Linux: rm -f package-lock.json
  npm install
  npx expo install --fix
  npx expo-doctor                              # should pass before you trust the build
  ```
- **Tip:** always install native packages with **`npx expo install <name>`** (not `npm install <name>`) so versions stay aligned, and run **`npx expo-doctor`** before building.

---

## Option 3 — For iPhone / iOS users

An Android APK **cannot** be installed on an iPhone — Apple uses a completely different app format. There are two ways an iPhone user can run Recipe Box:

### A) Easiest: Expo Go (no Apple account, no Mac)

The iPhone user runs the app through **Expo Go**, exactly like [Option 2](#option-2--run-it-from-a-computer-with-expo-go):

1. Install **Expo Go** from the App Store.
2. On a computer with the project, run `npx expo start`.
3. On the iPhone, open the **Camera** app, scan the QR code, and tap the banner to open it in Expo Go.
4. Add a Gemini key in Settings.

This needs the computer running on the same Wi-Fi. It's perfect for personal use or trying it out, but it's not a permanent standalone app.

### B) A real standalone iOS app (more involved)

To get a true installable iOS app (its own icon, no computer needed), you need:

- A paid **Apple Developer account** (~$99/year — Apple's rule, not Expo's).
- An iOS build, which EAS can produce **from Windows in the cloud** (no Mac required):
  ```bash
  eas build -p ios --profile preview
  ```
- A way to distribute it to people:
  - **TestFlight** — invite users by email; they install Apple's TestFlight app and get Recipe Box through it. Best for sharing with friends/family.
  - **App Store** — full public release, with Apple's review process.

In short: iPhone users can use the app today via **Expo Go (A)**; a permanent installed app **(B)** requires an Apple Developer membership and TestFlight/App Store distribution.

---

## Building / updating the APK (for the project owner)

When you change the app and want a new shareable APK:

```bash
npm install -g eas-cli
eas login                 # free Expo account
eas init                  # first time only — links the project
npx expo-doctor           # make sure this passes first
eas build -p android --profile preview
```

EAS builds in the cloud (~10–20 min) and gives you a download link for the new `.apk`. Share that link, or send the file directly. Users install the new APK over the old one; their saved recipes stay. Building a new version does **not** auto-update people who already have it — you resend the new APK or link.

---

## Privacy

- Recipes and your API key are stored **only on your device**.
- Screenshots and links you import are sent to **Google Gemini** to be read. On the free tier, Google may use submitted content to improve their models; enabling billing on your key turns that off.
- Nothing else leaves your phone, and recipes are never shared between users.

---

## Tech summary

Expo / React Native · React Navigation · on-device SQLite (`expo-sqlite`) · `expo-image-picker` · Google Gemini API (vision + text) · `schema.org/Recipe` (JSON-LD) parsing for blog links · Hebrew/English RTL-aware UI.
