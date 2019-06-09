import React from "react";
import { Text, Button } from "native-base";
import chroma from "chroma-js";

export const ColorTile = ({ item, onPress }) => {
  const { code, name, type } = item
  const buttonStyle = {
    backgroundColor: chroma(code)
      .hex()
      .toString(),
    flex: 1,
  };

  const textStyle = { fontSize: 10 };
  return (
    <Button
      block
      style={buttonStyle}
      light={chroma(code).luminance() >= 0.5}
      onPress={() => onPress(item)}
    >
      <Text numberOfLines={2} style={textStyle}>
        {name}
      </Text>
    </Button>
  );
};
