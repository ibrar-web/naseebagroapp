# Android Release Build Rules

## Pre-Build Checklist

### 1. Environment
- [ ] Set `currentEnv = 'development'` in `src/environment/index.ts`
- [ ] Verify API: `https://naseebagri.com/api/v1`
- [ ] Revert to `'local'` after the build is uploaded
- **Note:** `production` (api.naseebagro.com) is stale — use `development` for all release builds

### 2. Version Bump (required for every release)
File: `android/app/build.gradle`
```
versionCode 22          ← increment by 1 each release (Play Store rejects same/lower)
versionName "1.3.7"     ← semver: MAJOR.MINOR.PATCH
```
- `versionCode` must always increase — Play Store rejects a build with the same or lower code
- `versionName` is the human-readable label shown to users

### 3. Keystore
- File: `android/app/naseeb_upload.keystore`
- Config: `android/key.properties` (do NOT commit this file)
- Alias: `my-key-alias`
- `key.properties` is read by `build.gradle` at build time — it must exist locally

---

## Build Commands

### AAB — Play Store (recommended)
```bash
cd android
./gradlew clean bundleRelease
```
Always use `clean` for Play Store releases to avoid stale cached JS bundle artifacts from previous builds.
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### APK — Direct install / testing
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Version History

| versionCode | versionName | Date       | Notes                          |
|-------------|-------------|------------|-------------------------------|
| 22          | 1.3.7       | 2026-07-29 | Firebase notifications, market rates, alerts redesign |
| 21          | 1.3.6       | —          | Previous release               |

---

## After Upload

1. Switch `currentEnv` back to `'local'` in `src/environment/index.ts`
2. Commit both the version bump and the env revert in separate commits:
   - `chore: bump versionCode 22 / versionName 1.3.7`
   - `chore: revert env to local post-release`
3. Tag the release commit: `git tag v1.3.7`

---

## Environments

| Key         | API Base URL                        | Use For               |
|-------------|-------------------------------------|-----------------------|
| local       | http://192.168.18.65:3004/api/v1    | Local dev             |
| development | https://naseebagri.com/api/v1       | Staging               |
| production  | https://api.naseebagro.com/api/v1   | Release builds        |

Switch by changing `currentEnv` in `src/environment/index.ts`.

---

## Node Version

The `build.gradle` hardcodes the node path:
```
nodeExecutableAndArgs = ["/Users/ibrarhussain/.nvm/versions/node/v22.9.0/bin/node"]
```
If node version changes, update this path.
