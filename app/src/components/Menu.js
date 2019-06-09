import React from "react";
import { Image, ImageBackground, Linking } from "react-native";
import { Container, Content, Footer, Text, List, ListItem } from "native-base";
import { Constants } from "expo";
import packageJson from '../../package.json'

export class Menu extends React.Component {
  render() {
    const link = 'https://github.com/iakovmarkov/svet/'
    const routes = ["Home", "Swatches", "Gradient", "Custom", "Configuration"];
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
              height: 140 + Constants.statusBarHeight,
              paddingTop: Constants.statusBarHeight,
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
          <Text style={footerTextStyle}>Svet v{packageJson.version} </Text>
          <Text style={{ ...footerTextStyle, textDecorationLine: 'underline' }} onPress={() => Linking.openURL(link)}>
            {link}
          </Text>
        </Footer>
      </Container>
    );
  }
}
