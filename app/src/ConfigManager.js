import React from 'react';
import { AsyncStorage } from "react-native"

const debug = require("debug")("svet:app:config");

const DEFAULT_CONFIG = {
  BASIC_LOGIN: null,
  BASIC_PASSWORD: null,
  SERVER_URL: null,
}

export const ConfigContext = React.createContext(DEFAULT_CONFIG)

export class ConfigManager extends React.Component {
  static KEY = '@svet:config_1'

  static async getConfig() {
    let config = DEFAULT_CONFIG
    
    try {
      config = await AsyncStorage.getItem(ConfigManager.KEY)
      if(config !== null) {
        config = JSON.parse(config)
        debug('Config loaded:', config)
      } else {
        debug('Config not found, falling back to default')
      }
    } catch (e) {
      console.error('Loading config failed:', e)
    }
    return config
  }

  static async setConfig(config = DEFAULT_CONFIG) {
    try {
      await AsyncStorage.setItem(ConfigManager.KEY, JSON.stringify(config))
      debug('Config saved:', config)
    } catch (e) {
      console.error('Saving config failed:', e)
    }
    return config
  }

  state = DEFAULT_CONFIG

  async componentDidMount() {
      const config = await ConfigManager.getConfig()
      debug('Loaded configuration:', config)
      this.setState(config)
  }

  async handleConfigChange(config = {}) {
    const finalConfig = {
      ...this.state,
      ...config,
    }

    debug('Persisting configuration:', finalConfig)
    await ConfigManager.setConfig(finalConfig)
    this.setState(finalConfig)
  }

  render() {
    const value = { config: this.state, handleConfigChange: this.handleConfigChange }

    return (
      <ConfigContext.Provider value={value}>
        {this.props.children}
      </ConfigContext.Provider>
    )
  }
}
