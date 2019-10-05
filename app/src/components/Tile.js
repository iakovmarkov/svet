import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import chroma from "chroma-js";
import { LinearGradient } from "expo-linear-gradient";

export const Tile = props => {
  if (props.item.type === "color") {
    return <ColorTile {...props} />;
  } else if (props.item.type === "gradient") {
    return <GradientTile {...props} />;
  }
};

const getTileStyle = () => ({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 4,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
  elevation: 2
});

const getTextStyle = ({ backgroundColor }) => ({
  flex: 1,
  fontSize: 10,
  textTransform: "uppercase",
  marginLeft: 5,
  marginRight: 5,
  marginTop: 10,
  marginBottom: 10,
  textAlignVertical: "center",
  textAlign: "center",
  flexWrap: "wrap",
  color: chroma(backgroundColor).luminance() < 0.5 ? "#ffffff" : "#000000",
  textShadowColor:
    chroma(backgroundColor).luminance() >= 0.5 ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.3)",
  textShadowRadius: 4,
});

const ColorTile = ({ item, onPress }) => {
  const { code, name } = item;

  const backgroundColor = chroma(code)
    .hex()
    .toString();

  return (
    <TouchableOpacity
      style={{
        ...getTileStyle(),
        backgroundColor
      }}
      onPress={() => onPress(item)}
    >
      <Text style={getTextStyle({ backgroundColor })}>{name}</Text>
    </TouchableOpacity>
  );
};

const GradientTile = ({ item, onPress }) => {
  const { from, to } = item;

  return (
    <TouchableOpacity style={getTileStyle()} onPress={() => onPress(item)}>
      <LinearGradient
        colors={[`#${from.code}`, `#${to.code}`]}
        start={[0.3, 0]}
        end={[0.7, 1]}
        locations={[0, 1]}
        style={{
          left: 0,
          top: 0,
          height: "100%",
          width: "100%",
          position: "absolute"
        }}
      />
      <Text style={getTextStyle({ backgroundColor: item.from.code })}>
        {from.name}
      </Text>
      {to.name ? <Text style={getTextStyle({ backgroundColor: item.from.code })}>
        {to.name}
      </Text> : null}
    </TouchableOpacity>
  );
};
