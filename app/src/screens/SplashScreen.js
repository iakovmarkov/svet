import React from "react";
import { ImageBackground, Image } from "react-native";

/**
 * Photo by Nathan Dumlao on Unsplash
 */
export class SplashScreen extends React.Component {
  render() {
    return (
      <ImageBackground
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        source={require("../resources/splash.jpg")}
        resizeMode="cover"
      >
        <Image
          source={require("../resources/logo_transparent.png")}
          resizeMode="center"
          style={{ flex: 1, margin: '50%' }}
        />
      </ImageBackground>
    );
  }
}
