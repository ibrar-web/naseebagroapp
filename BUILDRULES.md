# Build Rules

Notes and known issues encountered during Android/iOS build processes. Refer to this before a new release build.

---

## 1. Android AAB (Release Bundle)

### 1.1 Keystore Path Resolution

`key.properties` is read by `android/app/build.gradle` using:

```groovy
def keystorePropertiesFile = rootProject.file("key.properties")
```

`rootProject` resolves to the `android/` directory, so `key.properties` lives at `android/key.properties`.

However, `storeFile` in `key.properties` is resolved by Gradle **relative to `android/app/`** (the module directory where `build.gradle` lives):

```groovy
storeFile file(keystoreProperties['storeFile'])
```

**Rule:** `storeFile` in `key.properties` must be a path relative to `android/app/` — **not** relative to `android/`.

```properties
# WRONG — resolves to android/app/app/naseeb_upload.keystore (double app)
storeFile=app/naseeb_upload.keystore

# CORRECT — resolves to android/app/naseeb_upload.keystore
storeFile=naseeb_upload.keystore
```

The keystore file itself lives at: `android/app/naseeb_upload.keystore`

---

### 1.2 Deobfuscation File Warning (Play Console)

When uploading an AAB to Google Play Console, you may see:

> *"There is no deobfuscation file associated with this App Bundle. If you use obfuscated code (R8/proguard), uploading a deobfuscation file will make crashes and ANRs easier to analyse and debug. Using R8/proguard can help reduce app size."*

**What this means:**

- Play Console expects a `mapping.txt` file alongside the AAB so it can de-obfuscate stack traces in crash reports (Firebase Crashlytics, Play's own ANR reports).
- If `minifyEnabled` is `false` (our current setting in `android/app/build.gradle`), no `mapping.txt` is generated because code is not obfuscated — the warning can be safely **ignored**.
- If `minifyEnabled` is ever set to `true` (to enable R8/ProGuard shrinking), the mapping file will be generated automatically at:
  `android/app/build/outputs/mapping/release/mapping.txt`
  Upload it to Play Console under **App Bundle Explorer → Downloads → Proguard mapping** when submitting the release.

**Current setting:**

```groovy
// android/app/build.gradle
def enableProguardInReleaseBuilds = false
```

**Action required now:** None — warning is informational only while obfuscation is disabled.

**If obfuscation is enabled in the future:**
1. Build the AAB (`./gradlew bundleRelease`)
2. Locate the mapping file: `android/app/build/outputs/mapping/release/mapping.txt`
3. Upload it to Play Console alongside the AAB

---

### 1.3 Build Commands

Node and adb are not on the default system PATH (managed via nvm). Always prefix commands:

```bash
# Set PATH once (or add to ~/.zshrc)
export PATH="/Users/ibrarhussain/.nvm/versions/node/v22.9.0/bin:/Users/ibrarhussain/Library/Android/sdk/platform-tools:$PATH"

# Clean
cd android && ./gradlew clean

# Build release AAB
cd android && ./gradlew bundleRelease

# Run debug on device/emulator
npx react-native run-android
```

`NODE_BINARY` is set in `android/gradle.properties` so Gradle subprocesses can find node without PATH tricks.

Output AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 2. App Versioning

### 2.1 Pre-Build Checklist — Ask Before Every Build

**Before touching `build.gradle`, answer this:**

> **Is this a minor update (bug fix / small tweak) or a major update (new feature / new screen)?**

| Answer | Increment | Example (from 1.1.6) |
|---|---|---|
| **Minor** — bug fix, UI tweak, crash fix | last digit `+1` | `1.1.6` → `1.1.7` |
| **Major** — new feature, new screen, significant change | middle digit `+1`, last digit reset to `0` | `1.1.6` → `1.2.0` |

Always increment `versionCode` by 1 regardless. Never reuse a `versionCode`.

### 2.2 How to Update

Edit `android/app/build.gradle`:

```groovy
versionCode 7          // always +1 from previous
versionName "1.1.7"   // minor bump: last digit +1
// OR
versionName "1.2.0"   // major bump: middle digit +1, last reset to 0
```

Current version: `versionName "1.3.0"` / `versionCode 13`

`versionCode` must always increase with every Play Store submission — even for the same `versionName`. Never reuse a `versionCode`.

---

## 3. Network Security (Release Builds — API Calls Failing)

Release builds on Android 9+ enforce a strict network security policy. Without `network_security_config.xml`, HTTPS calls can fail silently on some devices/versions.

**Fix applied:** `android/app/src/main/res/xml/network_security_config.xml` added and referenced in `AndroidManifest.xml`:

```xml
android:networkSecurityConfig="@xml/network_security_config"
```

The config:
- Trusts system CAs for all HTTPS connections in release
- Also trusts user-installed CAs in debug (useful for Charles Proxy / SSL inspection)
- Blocks all cleartext (HTTP) in release — API must be HTTPS

If API calls still fail in a release build, check:
1. The server SSL certificate is valid and not self-signed
2. `NODE_ENV` in `.env` is set to `development` (not `local`) before building the AAB
3. The `DEV_API` URL is correct and the server is reachable

---

## 4. App Optimisation (Play Console Warnings)

Play Console reports an **optimisation score** for each release. Current scores after v1.1.1 build:

| Metric | Score | Meaning |
|---|---|---|
| Optimisation score | — | Overall rating (requires obfuscation + shrinking enabled) |
| Obfuscation score | 1% | Code is almost entirely unobfuscated — R8 not active |
| Shrinking score | — | Dead code removal not enabled |
| R8 configuration | — | No custom ProGuard/R8 rules configured |

Play Console rates this as **Low** priority and suggests enabling R8 to reduce APK/AAB size and improve memory usage.

**Why scores are low:** `enableProguardInReleaseBuilds = false` in `build.gradle` disables R8 entirely. This is intentional for now — enabling R8 on a React Native app requires carefully configured keep rules to avoid stripping JS bridge classes and native modules.

**What each score means:**
- **Obfuscation** — renames classes/methods to short names, making reverse-engineering harder and reducing binary size.
- **Shrinking** — removes unused classes, methods, and resources (tree-shaking for Android).
- **R8 configuration** — presence of `proguard-rules.pro` entries that tell R8 what *not* to strip.

**To improve scores in a future release:**

1. Set `enableProguardInReleaseBuilds = true` in [android/app/build.gradle](android/app/build.gradle)
2. Add keep rules to [android/app/proguard-rules.pro](android/app/proguard-rules.pro) for React Native bridges:
   ```
   -keep class com.facebook.react.** { *; }
   -keep class com.google.firebase.** { *; }
   -keepclassmembers class * { @com.facebook.react.bridge.ReactMethod *; }
   ```
3. Build and test thoroughly — R8 can silently strip code that reflection-based libraries depend on.
4. Upload the generated `mapping.txt` to Play Console (see section 1.2).

**Action required now:** None — scores are informational. Address before a major public release to reduce AAB size and improve crash reporting readability.

---

## 5. Development vs Production Builds

`clearTextTraffic` is toggled per build type in `build.gradle`:

```groovy
debug {
    manifestPlaceholders = [usesCleartextTraffic: true]   // allows HTTP (dev API)
}
release {
    manifestPlaceholders = [usesCleartextTraffic: false]  // HTTPS only
}
```

To build an AAB that points to the **development API**, the base URL must be set in the app config before running `bundleRelease`. Release builds disable cleartext traffic — ensure the dev API is served over HTTPS or use a staging environment with HTTPS.
