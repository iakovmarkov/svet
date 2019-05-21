import React from "react";
import { Query, Mutation } from "react-apollo";
import {
  Container,
  Header,
  Title,
  Body,
  Content,
  Text,
  Card,
  CardItem,
  Spinner,
  Button
} from "native-base";
import { Col, Row, Grid } from "react-native-easy-grid";
import gql from "graphql-tag";

const query = gql`
  {
    devices {
      name
    }
    color
    on
  }
`;

const mutation = gql`
  mutation setColor($color: string) {
    setColor(color: $color)
  }
`;

const colors = [
  "white",
  "red",
  "purple",
  "teal",
  "violet",
  "salmon",
  "dawn",
  "lime",
  "yellow"
];

export class HomeScreen extends React.Component {
  render() {
    return (
      <Query query={query} pollInterval={1000}>
        {({ data, loading, error, refetch }) => (
          <Mutation mutation={mutation}>
            {(setColor) => {
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
              for (let i = 0; i < colors.length; i = i + 4) {
                const buttons = [];
                for (let j = 0; j < 4; j++) {
                  const color = colors[i + j];
                  if (color) {
                    const button = (
                      <Col key={j}>
                        <Button onPress={async () => {
                          try {
                            await setColor({ variables: { color } })
                          } catch (e) {
                            console.error(e))
                          }
                        }}>
                          <Text>{color}</Text>
                        </Button>
                      </Col>
                    );
                    buttons.push(button);
                  }
                }
                const row = <Row key={i}>{buttons}</Row>;
                colorButtons.push(row);
              }

              content = content || (
                <Grid>
                  <Row size={1}>
                    <Col size={4}>
                      <Text>Color: {data.color}</Text>
                    </Col>
                    <Col>
                      <Text>{data.on ? "on" : "off"}</Text>
                    </Col>
                  </Row>
                  {colorButtons}
                  <Row size={1}>
                    <Text>Devices: {data.devices.length}</Text>
                  </Row>
                </Grid>
              );

              return (
                <Container>
                  <Header>
                    <Body>
                      <Title>Svet Home</Title>
                    </Body>
                  </Header>
                  {content}
                </Container>
              );
            }}
          </Mutation>
        )}
      </Query>
    );
  }
}
