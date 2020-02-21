import React from "react";
import {
  Image,
  ImageBackground,
  Linking,
  ActivityIndicator,
  View,
  Text,
  ToastAndroid,
  TouchableOpacity
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList
} from "@react-navigation/drawer";
import packageJson from "../../package.json";
import { useFela } from "react-fela";
import gql from "graphql-tag";
import { useApolloNetworkStatus } from "react-apollo-network-status";
import { useQuery, useMutation } from "react-apollo";
import chroma from "../utils/chroma";
import Constants from "expo-constants";

const QUERY = gql`
  {
    color
    on
    devices {
      name
    }
  }
`;

const MUTATION_RECONNECT = gql`
  mutation reconnect {
    reconnect {
      color
      on
      devices {
        name
      }
    }
  }
`;

const MUTATION_TOGGLE = gql`
  mutation toggle($value: Boolean!) {
    toggle(value: $value) {
      color
      on
    }
  }
`;

const ruleSpinner = {
  position: "absolute",
  left: 5,
  top: 5 + Constants.statusBarHeight
};

const ruleFooter = {
  flex: 0,
  flexDirection: "column",
  justifyContent: "space-evenly",
  padding: 8
};

const ruleFooterText = {
  flex: 0,
  fontSize: 10,
  margin: 1,
  opacity: 0.2,
  color: "black"
};

const ruleFooterLink = { ...ruleFooterText, textDecorationLine: "underline" };

const ruleMenu = { flex: 1 };

const ruleImageBg = {
  height: 240,
  alignSelf: "stretch",
  justifyContent: "center",
  alignItems: "center"
};

const ruleImageLogo = { flex: 1 };

const ruleIndicator = ({ on }) => ({
  left: 0,
  top: 0,
  height: "100%",
  width: "100%",
  position: "absolute",
  backgroundColor: "#000000",
  opacity: on ? 0 : 0.5
});

const getTintColor = color => chroma(color).hex();

const DeviceCounter = ({ devices, loading }) => {
  const { css } = useFela();
  const [reconnect] = useMutation(MUTATION_RECONNECT, {
    update: (proxy, { data: { reconnect } }) => {
      const { devices = [] } = reconnect;
      ToastAndroid.show(
        `Connected to ${devices.length} devices`,
        ToastAndroid.SHORT
      );

      const data = proxy.readQuery({ query: QUERY });
      proxy.writeQuery({ query: QUERY, data: { ...data, devices } });
    }
  });

  return (
    <TouchableOpacity onPress={reconnect}>
      <Text style={css(ruleFooterText)}>
        {loading ? "Loading" : `${devices && devices.length} Devices Connected`}
      </Text>
    </TouchableOpacity>
  );
};

const Spinner = () => {
  const { numPendingQueries, numPendingMutations } = useApolloNetworkStatus();
  const { css } = useFela();

  if (numPendingQueries || numPendingMutations) {
    return <ActivityIndicator color="#ffffff" style={css(ruleSpinner)} />;
  }
  return null;
};

const Indicator = ({ on }) => {
  const { css } = useFela({ on });

  return <View style={css(ruleIndicator)} />;
};

export const Menu = props => {
  const { css } = useFela();
  const { data: { devices, on, color, loading } = {} } = useQuery(QUERY);
  const [toggle] = useMutation(MUTATION_TOGGLE, {
    variables: { value: !on },
    update: (proxy, { data: { toggle } }) => {
      const data = proxy.readQuery({ query: QUERY });
      proxy.writeQuery({ query: QUERY, data: { ...data, ...toggle } });
    }
  });

  const link = "https://github.com/iakovmarkov/svet/";

  return (
    <View style={css(ruleMenu)}>
      <ImageBackground
        source={require("../resources/splash_image.jpg")}
        style={css(ruleImageBg)}
      >
        <Indicator on={on} />
        <TouchableOpacity onPress={toggle}>
          <Image
            source={require("../resources/logo_transparent.png")}
            resizeMode="contain"
            style={css(ruleImageLogo)}
          />
        </TouchableOpacity>
        <Spinner />
      </ImageBackground>

      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} activeTintColor={getTintColor(color)} />
      </DrawerContentScrollView>

      <View style={css(ruleFooter)}>
        <DeviceCounter
          style={css(ruleFooterText)}
          devices={devices}
          loading={loading}
        />
        <Text style={css(ruleFooterText)}>Svet v{packageJson.version}</Text>
        <Text style={css(ruleFooterLink)} onPress={() => Linking.openURL(link)}>
          {link}
        </Text>
      </View>
    </View>
  );
};
