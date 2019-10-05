import React from "react";
import { View, FlatList } from "react-native";
import { graphql, compose } from "react-apollo";
import { Text, Icon } from "native-base";
import _ from "lodash/fp";
import gql from "graphql-tag";

import { withContext } from '../AppContext'
import { Tile } from "../components/Tile";

const query = gql`
  {
    color
    on
  }
`;

const mutationSetColor = gql`
  mutation setColor($color: String!) {
    setColor(color: $color) {
      color
      on
    }
  }
`;

const mutationSetGradient = gql`
  mutation setGradient($from: String!, $to: String!) {
    setGradient(from: $from, to: $to) {
      color
      on
    }
  }
`;

const options = (props) => {
  return {
    update: (proxy, { data }) => {
      console.log(data)
      const newData = data.setColor || data.setGradient || {}
      const storeData = proxy.readQuery({ query });
      proxy.writeQuery({ query, data: { ...storeData, ...newData } });
    }
  }
}

export const HomeScreenRow = compose(
  graphql(mutationSetColor, { name: "setColor", options }),
  graphql(mutationSetGradient, { name: "setGradient", options }),
  withContext,
)(({ title, colors, button, setColor, setGradient }) => {
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
      setColor({ variables: { color: item.code } });
    } else if (item.type === "gradient") {
        setGradient({ variables: { from: item.from.code, to: item.to.code } });
    }
  };

  const content =
    colors && colors.length ? (
      <FlatList
        style={tileRowStyle}
        keyExtractor={({ code, from }) => code || from.code}
        data={colors}
        renderItem={({ item }) => (
          <View style={tileStyle}>
            <Tile item={item} onPress={handlePress} />
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
