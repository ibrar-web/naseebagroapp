package com.naseebagri.app

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability

/**
 * Asks Google Play whether a newer build of this app is published, and starts Google's
 * in-app update screen. Uses the official Play In-App Updates library, so no server is involved.
 * Only works for installs that came from the Play Store (not debug builds or sideloaded APKs).
 */
class StoreUpdateModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private val manager by lazy { AppUpdateManagerFactory.create(reactApplicationContext) }

  override fun getName() = NAME

  @ReactMethod
  fun check(promise: Promise) {
    manager.appUpdateInfo
      .addOnSuccessListener { info ->
        val availability = info.updateAvailability()
        promise.resolve(
          Arguments.createMap().apply {
            putBoolean("available", availability == UpdateAvailability.UPDATE_AVAILABLE)
            putBoolean("inProgress", availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS)
            putInt("availableVersionCode", info.availableVersionCode())
            // 0–5, set per release in the Play Console API; 4+ is treated as a required update.
            putInt("priority", info.updatePriority())
            putInt("stalenessDays", info.clientVersionStalenessDays() ?: -1)
            putBoolean("immediateAllowed", info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE))
          },
        )
      }
      .addOnFailureListener { promise.reject("STORE_UPDATE_CHECK_FAILED", it.message, it) }
  }

  /** Opens Google's full-screen update flow. Resolves false when Play cannot start it. */
  @ReactMethod
  fun startUpdate(promise: Promise) {
    val activity = getCurrentActivity() ?: return promise.reject("NO_ACTIVITY", "No foreground activity")
    manager.appUpdateInfo
      .addOnSuccessListener { info ->
        val availability = info.updateAvailability()
        val canStart =
          (availability == UpdateAvailability.UPDATE_AVAILABLE ||
            availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) &&
            info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
        if (!canStart) {
          promise.resolve(false)
          return@addOnSuccessListener
        }
        manager.startUpdateFlow(info, activity, AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build())
        promise.resolve(true)
      }
      .addOnFailureListener { promise.reject("STORE_UPDATE_START_FAILED", it.message, it) }
  }

  companion object {
    const val NAME = "StoreUpdate"
  }
}
