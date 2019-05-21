import React from "react";
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
  Right
} from "native-base";
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

  refreshColors(n = 30) {
    const hardColors = [
      "Ivory",
      "red",
      "purple",
      "teal",
      "violet",
      "salmon",
      "dawn",
      "lime",
      "torch red"
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
  }

  render() {
    return (
      <Query query={query} pollInterval={1000}>
        {({ data, loading, error, refetch }) => {
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
                const button = (
                  <Col key={j}>
                    <Button
                      block
                      style={{
                        backgroundColor: `rgba(${buttonColor[1]}, ${
                          buttonColor[2]
                        }, ${buttonColor[3]}, 1)`
                      }}
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
                      <Text>{color}</Text>
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

          return (
            <Container>
              <Header
                style={{
                  backgroundColor: `rgb(${bgColor[0]}, ${bgColor[1]}, ${
                    bgColor[2]
                  })`
                }}
              >
                <Body>
                  <Title>Svet Home</Title>
                </Body>
                <Right>
                  <Button icon onPress={() => this.pickRandom()} rounded>
                    <Icon name="shuffle" />
                  </Button>
                  <Button icon onPress={() => this.refreshColors()} rounded>
                    <Icon name="refresh" />
                  </Button>
                  <Button
                    icon
                    onPress={() =>
                      data.on
                        ? this.props.mutationOff()
                        : this.props.mutationOn()
                    }
                    rounded
                  >
                    <Icon name={data.on ? "sunny" : "moon"} />
                  </Button>
                </Right>
              </Header>
              {content}
            </Container>
          );
        }}
      </Query>
    );
  }
}
