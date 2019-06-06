import React from "react";
import { View } from "react-native";
import { Constants } from "expo";
import { Query, Mutation, graphql } from "react-apollo";
import {
  Container,
  Header,
  Title,
  Body,
  Icon,
  Content,
  Text,
  Card,
  CardItem,
  Spinner,
  Button,
  Right,
  Toast
} from "native-base";
import variables from 'native-base/src/theme/variables/platform'
import _ from "lodash";
import { Col, Row, Grid } from "react-native-easy-grid";
import gql from "graphql-tag";
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

const mutationOn = gql`
  mutation turnOn {
    turnOn {
      on
    }
  }
`;

const mutationOff = gql`
  mutation turnOff {
    turnOff {
      on
    }
  }
`;

const refetchQueries = () => {
  return [{ query }];
};

@graphql(mutationSetColor, { name: "mutationSetColor" })
@graphql(mutationOn, { name: "mutationOn" })
@graphql(mutationOff, { name: "mutationOff" })
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

  pickRandom() {
    const color = _.sample(colorUtils.colors)[1];
    this.props.mutationSetColor({ variables: { color } });
    Toast.show({ text: `${color}` });
  }

  render() {
    return (
      <Query query={query} pollInterval={1000}>
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

          const bgColor = (data.color && data.color.split(",")) || [];
          const titleStyle = {
            color:
              colorUtils.contrastingColor([
                bgColor[0],
                bgColor[1],
                bgColor[2]
              ]) === "light"
                ? "#000000"
                : "#FFFFFF"
          };

          return (
            <Container
              style={{
                paddingTop: Constants.statusBarHeight,
                backgroundColor: `rgb(${bgColor[0]}, ${bgColor[1]}, ${
                  bgColor[2]
                })`
              }}
            >
              <Header
                style={{
                  backgroundColor: `rgb(${bgColor[0]}, ${bgColor[1]}, ${
                    bgColor[2]
                  })`
                }}
              >
                <Body>
                  <Title style={titleStyle}>Svet Home</Title>
                </Body>
                <Right>
                  <Button transparent onPress={() => this.pickRandom()}>
                    <Icon name="shuffle" />
                  </Button>
                  <Button transparent onPress={() => this.refreshColors()}>
                    <Icon name="refresh" />
                  </Button>
                  <Button
                    transparent
                    onPress={() =>
                      data.on
                        ? this.props.mutationOff()
                        : this.props.mutationOn()
                    }
                  >
                    <Icon name={data.on ? "sunny" : "moon"} />
                  </Button>
                </Right>
              </Header>
              <View style={{ height: '100%', backgroundColor: "#FFFFFF" }}>
                <View
                  style={{ height: '100%', 
                  paddingBottom: 5 + variables.footerHeight,
                    backgroundColor: `rgba(${bgColor[0]}, ${bgColor[1]}, ${
                      bgColor[2]
                    }, .1)`
                  }}
                >
                  {content}
                </View>
              </View>
            </Container>
          );
        }}
      </Query>
    );
  }
}
