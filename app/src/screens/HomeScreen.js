import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export class HomeScreen extends React.Component {
  async componentDidMount() {
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Home</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
