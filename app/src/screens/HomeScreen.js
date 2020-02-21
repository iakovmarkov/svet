import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppContainer } from "../components/AppContainer";
import { HomeScreenRow } from "../components/HomeScreenRow";

import { pipe, sampleSize, chunk, map } from "lodash/fp";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";

import colors from "../shared/colors";
import favorites from "../shared/favorites";

const QUERY = gql`
  {
    recents {
      type
      color
      gradient {
        from
        to
      }
    }
  }
`;

const ShuffleButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Feather size={16} name="shuffle" />
    </View>
  </TouchableOpacity>
);

const generateSwatches = (count = 20) => {
  const type = "color";
  const swatches = pipe(
    sampleSize(count),
    map(({ color }) => ({ color, type }))
  )(colors);

  return swatches;
};

const generateGradients = (count = 20) => {
  const type = "gradient";
  const gradients = pipe(
    sampleSize(count * 2),
    chunk(2),
    map(([from, to]) => ({
      type,
      gradient: {
        from: from.color,
        to: to.color
      }
    }))
  )(colors);

  return gradients;
};

export const HomeScreen = () => {
  const { data: { recents = [], loading } = {} } = useQuery(QUERY);
  const [swatches, setSwatches] = useState(generateSwatches());
  const [gradients, setGradients] = useState(generateGradients());

  return (
    <AppContainer>
      <HomeScreenRow title="Favorites" colors={favorites} />
      <HomeScreenRow title="Recents" colors={recents} loading={loading} />
      <HomeScreenRow
        title="Swatches"
        colors={swatches}
        button={
          <ShuffleButton onPress={() => setSwatches(generateSwatches())} />
        }
      />
      <HomeScreenRow
        title="Gradients"
        colors={gradients}
        button={
          <ShuffleButton onPress={() => setGradients(generateGradients())} />
        }
      />
    </AppContainer>
  );
};
