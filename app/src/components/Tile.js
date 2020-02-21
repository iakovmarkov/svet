import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { pipe, find, get } from "lodash/fp";
import { useFela } from "react-fela";

import chroma from "../utils/chroma";
import colors from "../shared/colors";

const ruleTile = ({ theme, color }) => ({
  ...theme.shadow,
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 4,
  overflow: "hidden",
  backgroundColor: chroma(color).hex()
});

const ruleTitleText = ({ color }) => ({
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
  color: chroma(color).luminance() < 0.5 ? "#ffffff" : "#000000",
  textShadowColor:
    chroma(color).luminance() >= 0.5
      ? "rgba(255, 255, 255, 0.7)"
      : "rgba(0, 0, 0, 0.3)",
  textShadowRadius: 4
});

const ruleGradient = {
  left: 0,
  top: 0,
  height: "100%",
  width: "100%",
  position: "absolute"
}

const getColorName = code => {
  code = code.toUpperCase();
  return (
    pipe(
      find(({ color }) => code.includes(color)),
      get("name")
    )(colors) || code
  );
};

const Title = ({ name, color }) => {
  const { css } = useFela({ color });
  return <Text style={css(ruleTitleText)}>{name || getColorName(color)}</Text>;
};

const ColorTile = ({ item, onPress }) => {
  const { color, name } = item;
  const { css } = useFela({ color });

  return (
    <TouchableOpacity style={css(ruleTile)} onPress={() => onPress(item)}>
      <Title name={name} color={color} />
    </TouchableOpacity>
  );
};

const GradientTile = ({ item, onPress }) => {
  const {
    name,
    gradient: { from, to }
  } = item;
  let title = null;
  const { css } = useFela({ color: from });

  if (name) {
    title = <Title name={name} color={from} />;
  } else {
    title = (
      <React.Fragment>
        <Title color={from} />
        <Title color={to} />
      </React.Fragment>
    );
  }

  return (
    <TouchableOpacity style={css(ruleTile)} onPress={() => onPress(item)}>
      <LinearGradient
        colors={[`#${from}`, `#${to}`]}
        start={[0.3, 0]}
        end={[0.7, 1]}
        locations={[0, 1]}
        style={css(ruleGradient)}
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
