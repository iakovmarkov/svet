import React from "react";
import { Constants } from "expo";
import { withNavigation } from "react-navigation";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
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

export class AppContainer extends React.Component {
  render() {
    return (
      <Container
        style={{
          paddingTop: Constants.statusBarHeight
        }}
      >
        {this.props.children}
      </Container>
    );
  }
}

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

@withNavigation
@graphql(query)
@graphql(mutation, {
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
})
export class AppHeader extends React.Component {
  toggle() {
    const { mutation } = this.props;
    mutation();
  }

  render() {
    const {
      children = "Svet",
      navigation,
      data: { on, loading, color } = {},
      noSwitch
    } = this.props;

    return (
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
                onValueChange={this.toggle.bind(this)}
              />
            )}
          </Right>
        )}
      </Header>
    );
  }
}
