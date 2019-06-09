import React from 'react';
import { AppContainer, AppHeader } from '../components/AppUI'
import { Body, Content,Text, Card, CardItem } from "native-base";

export class CustomScreen extends React.Component {
  render() {
    return (
      <AppContainer>
        <AppHeader>Custom Color</AppHeader>
        <Content padder>
          <Card>
            <CardItem>
              <Body>
                <Text>Not Implemented</Text>
              </Body>
            </CardItem>
          </Card>
        </Content>
      </AppContainer>
    );
  }
}
