import React from "react";
import { View } from "react-native";
import { Query, graphql } from "react-apollo";
import {
  Text,
  Card,
  CardItem,
  Spinner,
  Button,
  Body,
} from "native-base";
import _ from "lodash";
import { Col, Row, Grid } from "react-native-easy-grid";
import gql from "graphql-tag";

import { AppContainer, AppHeader } from '../components/AppUI'

import colorUtils from "../utils/colors";

const query = gql`
  {
    devices {
      name
    }
    color
    on
  }
`;

const mutationSetColor = gql`
  mutation setColor($color: String!) {
    setColor(color: $color) {
      color
    }
  }
`;

const refetchQueries = () => {
  return [{ query }];
};

@graphql(mutationSetColor, { name: "mutationSetColor" })
export class HomeScreen extends React.Component {
  state = {
    colors: []
  };

  componentDidMount() {
    this.refreshColors();
  }

  refreshColors(n = 32) {
    const hardColors = [
      "Ivory",
      "red",
      "purple",
      "teal",
      "violet",
      "salmon",
      "dawn",
      "lime",
      "torch red",
      "rock spray"
    ];

    const colors = hardColors.concat(
      _.sampleSize(colorUtils.colors, n - hardColors.length).map(
        color => color[1]
      )
    );

    this.setState({ colors });
  }

  render() {
    return (
      <Query query={query}>
        {({ data = {}, loading, error, refetch }) => {
          let content;

          if (loading) {
            content = <Spinner />;
          }

          const refetchBtn = (
            <Button block transparent onPress={() => refetch()}>
              <Text>Refetch</Text>
            </Button>
          );

          if (error) {
            console.log(error)
            content = (
              <Card>
                <CardItem>
                  <Body>
                    <Text>Error: {JSON.stringify(error)}</Text>
                    {refetchBtn}
                  </Body>
                </CardItem>
              </Card>
            );
          }

          const colorButtons = [];
          const COLS = 4;
          for (let i = 0; i < this.state.colors.length; i = i + COLS) {
            const buttons = [];
            for (let j = 0; j < COLS; j++) {
              const color = this.state.colors[i + j];
              if (color) {
                const buttonColor = colorUtils.findColor(color) || {};
                const buttonStyle = {
                  backgroundColor: `rgba(${buttonColor[1]}, ${
                    buttonColor[2]
                  }, ${buttonColor[3]}, 1)`,
                  width: "90%",
                  height: "90%",
                  margin: "5%"
                };
                const button = (
                  <Col key={j}>
                    <Button
                      block
                      style={buttonStyle}
                      light={
                        colorUtils.contrastingColor([
                          buttonColor[1],
                          buttonColor[2],
                          buttonColor[3]
                        ]) === "light"
                      }
                      onPress={async () => {
                        try {
                          await this.props.mutationSetColor({
                            variables: { color },
                            onError: (...args) => console.error(args)
                          });
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <Text numberOfLines={2} style={{ fontSize: 10 }}>
                        {color}
                      </Text>
                    </Button>
                  </Col>
                );
                buttons.push(button);
              } else {
                buttons.push(<Col key={j} />);
              }
            }
            const row = <Row key={i}>{buttons}</Row>;
            colorButtons.push(row);
          }

          content = content || <Grid>{colorButtons}</Grid>;

          return (
            <AppContainer>
              <AppHeader>Svet Home</AppHeader>
              <View style={{ height: '100%', backgroundColor: "#FFFFFF" }}>
                <View style={{ height: '100%' }} >
                  {content}
                </View>
              </View>
            </AppContainer>
          );
        }}
      </Query>
    );
  }
}
