import React from "react";
import { View, FlatList } from "react-native";
import { graphql, compose } from "react-apollo";
import { Text, Icon } from "native-base";
import _ from "lodash/fp";
import gql from "graphql-tag";

import { ColorTile } from "../components/ColorTile";

const mutationSetColor = gql`
  mutation setColor($color: String!) {
    setColor(color: $color) {
      color
    }
  }
`;

export const HomeScreenRow = compose(
  graphql(mutationSetColor, { name: "setColor" })
)(({ title, colors, button, setColor }) => {
  const viewStyle = {
    flex: 1,
    margin: 5
  };
  const titleStyle = {
    margin: 5,
    flexDirection: "row",
    alignItems: "center"
  };

  const titleTextStyle = {
    flex: 1
  };

  const titleButtonStyle = {
    flex: 0
  };

  const tileRowStyle = {
    flex: 1,
    marginRight: -5,
    marginLeft: -5
  };

  const tileStyle = {
    flex: 1,
    width: 80,
    marginRight: 5,
    marginLeft: 5,
    padding: 5
  };

  const placeholderStyle = {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    opacity: 0.2
  };

  const handlePress = item => {
    if (item.type === "color") {
      console.log(item.code);
      setColor({ variables: { color: item.code } });
    }
  };

  const content =
    colors && colors.length ? (
      <FlatList
        style={tileRowStyle}
        keyExtractor={({ code }) => code}
        data={colors}
        renderItem={({ item }) => (
          <View style={tileStyle}>
            <ColorTile item={item} onPress={handlePress} />
          </View>
        )}
        horizontal
      />
    ) : (
      <View style={placeholderStyle}>
        <Icon name="sad" />
        <Text>Nothing here yet</Text>
      </View>
    );

  return (
    <View style={viewStyle}>
      <View style={titleStyle}>
        <Text style={titleTextStyle}>{title}</Text>
        <View style={titleButtonStyle}>{button}</View>
      </View>
      {content}
    </View>
  );
});
