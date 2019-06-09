import React from "react";
import { Constants } from "expo";
import { withNavigation } from "react-navigation";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
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
import chroma from "chroma-js";

export const AppContainer = ({ children }) => (
      <Container
        style={{
          paddingTop: Constants.statusBarHeight
        }}
      >
        {children}
      </Container>
    );

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

export const AppHeader = compose(
  withNavigation,
  graphql(query),
  graphql(mutation, {
    name: "mutation",
    options: props => ({
      variables: { value: !props.data.on },
      optimisticResponse: {
        toggle: { __typename: "Query", ...props.data, on: !props.data.on }
      },
      update: (proxy, { data: { toggle } }) => {
        const data = proxy.readQuery({ query });
        proxy.writeQuery({ query, data: { ...data, ...toggle } });
      }
    })
  }),
)(
  ({
    children = "Svet",
    navigation,
    data: { on, loading, color = "red" } = {},
    mutation,
    noSwitch
  }) => (
    <Header>
      <Left>
        <Button transparent onPress={() => navigation.toggleDrawer()}>
          <Icon name="menu" />
        </Button>
      </Left>
      <Body>
        <Title>{children}</Title>
      </Body>
      {!noSwitch && (
        <Right>
          {loading ? (
            <Spinner color="white" />
          ) : (
            <Switch
              thumbColor={chroma(color).desaturate(on ? 0 : 2)}
              trackColor={{
                false: chroma(color)
                  .alpha(0.5)
                  .desaturate(2),
                true: chroma(color)
                  .alpha(0.5)
                  .desaturate(1)
              }}
              disabled={loading}
              value={on}
              onValueChange={() => mutation()}
            />
          )}
        </Right>
      )}
    </Header>
  )
)
