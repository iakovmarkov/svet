import React from "react";
import { Label, Form, Item, Input, Button, Text, Toast } from "native-base";
import { ConnectionManager } from "../ConnectionManager";
import { ConfigManager } from "../ConfigManager";

class Field extends React.Component {
  render() {
    const { onChange, label, placeholder, value } = this.props;
    return (
      <Item stackedLabel>
        <Label>{label}</Label>
        <Input
          onChangeText={onChange}
          placeholder={placeholder}
          value={value}
        />
      </Item>
    );
  }
}

export class ConfigurationForm extends React.Component {
  state = {};

  componentWillMount() {
    this.setState(this.props.initialValues);
  }

  createInputHandler(field) {
    return value => {
      this.setState({ [field]: value });
    };
  }

  async onSave() {
    try {
      await ConnectionManager.checkConnection(this.state.SERVER_URL);
      await ConfigManager.setConfig(this.state)
    } catch (e) {
      console.error("Connecting to Svet server failed:", e);

      Toast.show({
        text: "Connection to Svet server failed! Please check that Svet is running and that the URL is correct.",
        type: "danger"
      });

      return
    }

    Toast.show({
      text: "Connected to Svet",
      type: "success"
    });
  }

  onReset() {
    this.setState(this.props.initialValues);
  }

  render() {
    return (
      <React.Fragment>
        <Form>
          <Field
            label="Svet Server"
            placeholder="https://svet.iakov.me/"
            value={this.state.SERVER_URL}
            onChange={this.createInputHandler("SERVER_URL")}
          />
          <Field
            label="Username"
            placeholder="svet"
            value={this.state.BASIC_LOGIN}
            onChange={this.createInputHandler("BASIC_LOGIN")}
          />
          <Field
            label="Password"
            placeholder="s3cr3t"
            value={this.state.BASIC_PASSWORD}
            onChange={this.createInputHandler("BASIC_PASSWORD")}
          />
        </Form>
        <Button block primary onPress={this.onSave.bind(this)}>
          <Text>Save</Text>
        </Button>
        <Button block transparent onPress={this.onReset.bind(this)}>
          <Text>Reset</Text>
        </Button>
      </React.Fragment>
    );
  }
}