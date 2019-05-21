import React from 'react';
import { Container, Content, Spinner } from 'native-base';
import { Font } from 'expo';
import { Ionicons } from '@expo/vector-icons';

import { ConfigManager } from './src/ConfigManager'
import { ConnectionManager } from './src/ConnectionManager'
import { ApplicationUI } from './src/ApplicationUI'

export default class App extends React.Component {
  state = {
    ready: false,
  }

  async componentDidMount() {
    await Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });

    this.setState({ ready: true })
  }

  render() {
    if (this.state.ready) {
      return (
        <ConfigManager>
          <ConnectionManager>
            <ApplicationUI />
          </ConnectionManager>
        </ConfigManager>
      )
    } else {
      return (
        <Container>
          <Content>
            <Spinner />
          </Content>
        </Container>
      )
    }
  }
}
