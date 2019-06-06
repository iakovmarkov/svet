import { AsyncStorage } from "react-native"

export const DEFAULT_CONFIG = {
  BASIC_LOGIN: null,
  BASIC_PASSWORD: null,
  SERVER_URL: null,
}

export class ConfigManager {
  // 4 & 7
  static KEY = '@svet:config_8'

  static async getConfig() {
    let config = DEFAULT_CONFIG
    
    try {
      const json = await AsyncStorage.getItem(ConfigManager.KEY)
      if(json !== null) {
        config = JSON.parse(json)
      }
    } catch (e) {
      console.error('Loading config failed:', e)
    }

    return config
  }

  static async setConfig(config = DEFAULT_CONFIG) {
    try {
      await AsyncStorage.setItem(ConfigManager.KEY, JSON.stringify(config))
    } catch (e) {
      console.error('Saving config failed:', e)
    }
    return config
  }
}
