import React from "react";
import { TouchableOpacity, Text } from "react-native";
import chroma from "chroma-js";
import { LinearGradient } from "expo-linear-gradient";
import { pipe, find, get } from "lodash/fp";

import colors from "../shared/colors";

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
    chroma(backgroundColor).luminance() >= 0.5
      ? "rgba(255, 255, 255, 0.7)"
      : "rgba(0, 0, 0, 0.3)",
  textShadowRadius: 4
});

const getColorName = code => {
  code = code.toUpperCase()
  return (
    pipe(
      find(({ color }) => code.includes(color)),
      get('name')
    )(colors) || code
  );
};

const Title = ({ backgroundColor, name, code }) => (
  <Text style={getTextStyle({ backgroundColor })}>
    {name || getColorName(code)}
  </Text>
);

const ColorTile = ({ item, onPress }) => {
  const { color, name } = item;

  const backgroundColor = chroma(color)
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
      <Title backgroundColor={backgroundColor} name={name} code={color} />
    </TouchableOpacity>
  );
};

const GradientTile = ({ item, onPress }) => {
  const {
    name,
    gradient: { from, to }
  } = item;
  let title = null;

  if (name) {
    title = <Title backgroundColor={from} name={name} />;
  } else {
    title = (
      <React.Fragment>
        <Title backgroundColor={from} code={from} />
        <Title backgroundColor={from} code={to} />
      </React.Fragment>
    );
  }

  return (
    <TouchableOpacity style={getTileStyle()} onPress={() => onPress(item)}>
      <LinearGradient
        colors={[`#${from}`, `#${to}`]}
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
      {title}
    </TouchableOpacity>
  );
};

export const Tile = props => {
  if (props.item.type === "color") {
    return <ColorTile {...props} />;
  } else if (props.item.type === "gradient") {
    return <GradientTile {...props} />;
  }
};
