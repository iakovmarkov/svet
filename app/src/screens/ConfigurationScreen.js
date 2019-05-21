import React from "react";
import { Container, Header, Content, Body, Title } from "native-base";

import { ConfigContext } from "../ConfigManager";
import { ConfigurationForm } from "../components/ConfigurationForm";

export class ConfigurationScreen extends React.Component {
  render() {
    const { wrap } = this.props;
    const content = (
      <ConfigContext.Consumer>
        {({ config, handleConfigChange }) => (
          <ConfigurationForm
            initialValues={config}
            onSave={handleConfigChange}
          />
        )}
      </ConfigContext.Consumer>
    );

    return wrap ? (
      <Container>
        <Header>
          <Body>
            <Title>Svet Configuration</Title>
          </Body>
        </Header>
        <Content padder>{content}</Content>
      </Container>
    ) : (
      content
    );
  }
}
