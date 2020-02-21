import React from "react";
import { View, FlatList, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "react-apollo";
import { useFela } from "react-fela";
import gql from "graphql-tag";

import { Tile } from "../components/Tile";

const QUERY = gql`
  {
    color
    on
  }
`;

const MUTATION_COLOR = gql`
  mutation setColor($color: String!) {
    setColor(color: $color) {
      color
      on
    }
  }
`;

const MUTATION_GRADIENT = gql`
  mutation setGradient($from: String!, $to: String!) {
    setGradient(from: $from, to: $to) {
      color
      on
    }
  }
`;

const ICON_SIZE = 32;

const options = {
  update: (proxy, { data }) => {
    const newData = data.setColor || data.setGradient || {};
    const storeData = proxy.readQuery({ query: QUERY });
    proxy.writeQuery({ query: QUERY, data: { ...storeData, ...newData } });
  }
};

const ruleView = ({ theme }) => ({
  flex: 1,
  padding: theme.dimensions.padding
});

const ruleTitle = ({ theme }) => ({
  margin: theme.dimensions.margin,
  flexDirection: "row",
  alignItems: "center"
});

const ruleTitleText = {
  flex: 1
};

const ruleTitleButton = {
  flex: 0
};

const ruleTileRow = ({ theme }) => ({
  flex: 1,
  marginRight: -theme.dimensions.margin,
  marginLeft: -theme.dimensions.margin
});

const ruleTile = ({ theme }) => ({
  flex: 1,
  width: theme.dimensions.tileWidth,
  marginRight: theme.dimensions.margin,
  marginLeft: theme.dimensions.margin,
  padding: theme.dimensions.padding
});

const rulePlaceholder = {
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  opacity: 0.2
};

export const HomeScreenRow = ({ title, colors, loading, button }) => {
  const [setColor] = useMutation(MUTATION_COLOR, options);
  const [setGradient] = useMutation(MUTATION_GRADIENT, options);
  const { css } = useFela()

  const handlePress = item => {
    if (item.type === "color") {
      setColor({ variables: { color: item.color } });
    } else if (item.type === "gradient") {
      setGradient({
        variables: { from: item.gradient.from, to: item.gradient.to }
      });
    }
  };

  let content = (
    <View style={css(rulePlaceholder)}>
      <Feather size={ICON_SIZE} name="cloud-lightning" />
      <Text>Nothing here yet</Text>
    </View>
  );

  if (loading) {
    content = (
      <View style={css(rulePlaceholder)}>
        <Feather size={ICON_SIZE} name="cloud" />
        <Text>Loading</Text>
      </View>
    );
  } else if (colors && colors.length) {
    content = (
      <FlatList
        style={css(ruleTileRow)}
        keyExtractor={(item, i) =>
          `${i}_${item.name ||
            item.color ||
            `${item.gradient.from}_${item.gradient.to}`}`
        }
        data={colors}
        renderItem={({ item }) => (
          <View style={css(ruleTile)}>
            <Tile item={item} onPress={handlePress} />
          </View>
        )}
        horizontal
      />
    );
  }

  return (
    <View style={css(ruleView)}>
      <View style={css(ruleTitle)}>
        <Text style={css(ruleTitleText)}>{title}</Text>
        <View style={css(ruleTitleButton)}>{button}</View>
      </View>
      {content}
    </View>
  );
};
