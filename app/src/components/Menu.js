import React from "react";
import { Image, ImageBackground, Linking } from "react-native";
import { Container, Content, Footer, Text, List, ListItem, Toast } from "native-base";
import Constants from "expo-constants";
import packageJson from '../../package.json'
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";

const query = gql`
  {
    devices {
      name
    }
  }
`;

const mutation = gql`
  mutation reconnect {
    reconnect {
      devices {
        name
      }
    }
  }
`;

const options = (props) => {
  return {
    update: (proxy, { data: { reconnect } }) => {
      const { devices } = reconnect
      Toast.show({
        text: `Connected to ${devices.length} devices`,
        type: "success"
      });

      const data = proxy.readQuery({ query });
      proxy.writeQuery({ query, data: {...data, devices } });
    }
  }
}

const DeviceCounter = compose(
  graphql(mutation, { options }),
)(({ style, deviceCount, mutate }) => (
  <Text style={style} onPress={() => mutate()}>{deviceCount} Devices Connected</Text>
))

@graphql(query)
export class Menu extends React.Component {
  render() {
    const { devices, color, on, loading } = this.props.data

    const link = 'https://github.com/iakovmarkov/svet/'
    const routes = ["Home", /*"Swatches", "Gradient", "Custom",*/ "Configuration"];

    const footerStyle = {
      backgroundColor: "transparent",
      flexDirection: "column",
      justifyContent: "space-evenly",
      padding: 8,
    };
    const footerTextStyle = {
      flex: 1,
      fontSize: 10,
      opacity: 0.2,
      color: "black"
    };

    return (
      <Container>
        <Content>
          <ImageBackground
            source={require("../resources/splash.jpg")}
            style={{
              height: 240,
              alignSelf: "stretch",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Image
              source={require("../resources/logo_transparent.png")}
              resizeMode="contain"
              style={{ flex: 1 }}
            />
          </ImageBackground>
          <List
            dataArray={routes}
            keyExtractor={(key) => key}
            renderRow={data => {
              return (
                <ListItem
                  button
                  onPress={() => this.props.navigation.navigate(data)}
                >
                  <Text>{data}</Text>
                </ListItem>
              );
            }}
          />
        </Content>
        <Footer style={footerStyle}>
          {
            loading ? <Text style={footerTextStyle}>Loading</Text>
            : <DeviceCounter style={footerTextStyle} deviceCount={devices.length} />
          }
          <Text style={footerTextStyle}>Svet v{packageJson.version}</Text>
          <Text style={{...footerTextStyle, textDecorationLine: 'underline' }} onPress={() => Linking.openURL(link)}>
            {link}
          </Text>
        </Footer>
      </Container>
    );
  }
}
