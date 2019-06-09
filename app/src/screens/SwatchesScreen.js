import React from 'react';
import { AppContainer, AppHeader } from '../components/AppUI'
import { Body, Content,Text, Card, CardItem } from "native-base";

export class SwatchesScreen extends React.Component {
  render() {
    return (
      <AppContainer>
        <AppHeader>Swatches</AppHeader>
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
