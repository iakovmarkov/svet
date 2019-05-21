import React from "react";
import { Container, Header, Content, Body, Title } from "native-base";

import { Context } from "../AppContext";
import { ConfigurationForm } from "../components/ConfigurationForm";

export class ConfigurationScreen extends React.Component {
  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>Svet Configuration</Title>
          </Body>
        </Header>
        <Content padder>
          <Context.Consumer>
            {({ config, handleConfigChange }) => (
              <ConfigurationForm
                initialValues={config}
                onSave={handleConfigChange}
              />
            )}
          </Context.Consumer>
        </Content>
      </Container>
    );
  }
}
