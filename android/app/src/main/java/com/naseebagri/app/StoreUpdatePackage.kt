package com.naseebagri.app

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class StoreUpdatePackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == StoreUpdateModule.NAME) StoreUpdateModule(reactContext) else null

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      StoreUpdateModule.NAME to
        ReactModuleInfo(StoreUpdateModule.NAME, StoreUpdateModule::class.java.name, false, false, false, false),
    )
  }
}
