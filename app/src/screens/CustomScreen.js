import React from 'react';
import { Container, Header, Title, Left, Icon, Right, Button, Body, Content,Text, Card, CardItem } from "native-base";

export class CustomScreen extends React.Component {
  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>Custom Color</Title>
          </Body>
          <Right />
        </Header>
        <Content padder>
          <Card>
            <CardItem>
              <Body>
                <Text>Not Implemented</Text>
              </Body>
            </CardItem>
          </Card>
        </Content>
      </Container>
    );
  }
}
