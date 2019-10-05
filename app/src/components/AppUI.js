import React from "react";
import Constants from "expo-constants";
import { withNavigation } from "react-navigation";
import gql from "graphql-tag";
import { graphql, compose, Mutation } from "react-apollo";
import { useApolloNetworkStatus } from "react-apollo-network-status";
import {
  Container,
  Header,
  Left,
  Button,
  Body,
  Title,
  Right,
  Icon,
  Switch,
  Spinner
} from "native-base";
import variables from "native-base/src/theme/variables/platform";
import chroma from "chroma-js";

const query = gql`
  {
    color
    on
  }
`;

const mutation = gql`
  mutation toggle($value: Boolean!) {
    toggle(value: $value) {
      color
      on
    }
  }
`;

const getHeaderColor = (color = variables.brandPrimary) =>
  chroma(color)
    .desaturate(1)
    .darken();

export const AppContainer = compose(graphql(query))(
  ({ children, data: { color, on, loading } }) => (
    <Container
      style={{
        borderTopColor: getHeaderColor(color),
        borderTopWidth: Constants.statusBarHeight
      }}
    >
      {children}
    </Container>
  )
);

export const AppHeader = compose(
  withNavigation,
  graphql(query)
)(
  ({
    children = "Svet",
    navigation,
    data: { on, color, loading } = {},
    noSwitch
  }) => {
    const status = useApolloNetworkStatus();
    return (
      <Header noShadow style={{ backgroundColor: getHeaderColor(color) }}>
        <Left style={{ flex: 0 }}>
          <Button transparent onPress={() => navigation.toggleDrawer()}>
            <Icon name="menu" />
          </Button>
        </Left>
        <Body>
          <Title style={{ marginLeft: 5 }}>{children}</Title>
        </Body>
        {!noSwitch && (
          <Right>
            <Mutation
              mutation={mutation}
              variables={{ value: !on }}
              optimisticResponse={{
                toggle: {
                  __typename: "Query",
                  color,
                  loading,
                  on: !on
                }
              }}
              update={(proxy, { data: { toggle } }) => {
                const data = proxy.readQuery({ query });
                proxy.writeQuery({ query, data: { ...data, ...toggle } });
              }}
            >
              {(mutate, { loading: mutating }) =>
                !mutating &&
                (loading ||
                  status.numPendingQueries ||
                  status.numPendingMutations) ? (
                  <Spinner color="white" />
                ) : (
                  <Switch
                    thumbColor={chroma(color).desaturate(on ? 0 : 2)}
                    disabled={mutating}
                    value={on}
                    onValueChange={() => mutate()}
                  />
                )
              }
            </Mutation>
          </Right>
        )}
      </Header>
    );
  }
);
