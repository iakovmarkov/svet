import React from "react";
import {
  Text,
  View,
  TouchableHighlight,
  TextInput,
  ActivityIndicator,
  Alert
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFela } from "react-fela";
import { Formik } from "formik";
import * as Yup from "yup";

const ruleForm = ({ theme }) => ({
  padding: theme.dimensions.padding * 2,
  height: '100%',
  justifyContent: 'space-between',
});

const ruleFieldContainer = {
  flex: 1,
  marginTop: 50,
  marginBottom: 50,
}

const ruleButtonContainer = ({ theme }) => ({
  flex: 0,
  margin: -theme.dimensions.margin,
  paddingBottom: theme.dimensions.margin,
  flexDirection: "row"
});

const ruleInput = ({ theme }) => ({
  ...theme.control,
  marginTop: 5,
  marginBottom: 5,
});

const ruleError = ({ theme }) => ({
  margin: theme.dimensions.margin,
  marginTop: 0,
  paddingLeft: theme.dimensions.padding,
  color: "#990000"
});

const ruleButton = ({ theme, type, disabled, icon }) => ({
  ...theme.control,
  ...theme.shadow,
  margin: theme.dimensions.margin,
  height: 40,
  backgroundColor: "#fefefe",
  width: icon ? 40 : undefined,
  justifyContent: "center",
  alignItems: "center",
  flexGrow: type === "submit" ? 1 : 0,
  borderColor: type === "submit" ? theme.colors.blue : theme.colors.red,
  opacity: disabled ? 0.4 : 1
});

const Field = ({ name, placeholder, handleChange, handleBlur, values, touched, errors, ...props }) => {
  const { css } = useFela();
  return (
    <>
      <TextInput
        onChangeText={handleChange(name)}
        onBlur={handleBlur(name)}
        value={values[name]}
        placeholder={placeholder}
        style={css(ruleInput)}
        {...props}
      />
      <Text style={css(ruleError)}>
        {touched[name] && errors[name] ? errors[name] : null}
      </Text>
    </>
  );
};

const Button = ({ onPress, children, loading, type, disabled, icon }) => {
  const { css } = useFela({ type, disabled, icon });

  return (
    <TouchableHighlight
      underlayColor="#f0f0f0"
      onPress={!disabled && onPress}
      style={css(ruleButton)}
    >
      {loading ? <ActivityIndicator /> : children}
    </TouchableHighlight>
  );
};

const validationSchema = Yup.object({
  SERVER_URL: Yup.string()
    .url()
    .required("Server URL is required")
});

export const ConfigurationForm = ({ onSave, initialValues }) => {
  const { css } = useFela();
  const onSubmit = async (values, actions) => {
    await onSave(values);
    Alert.alert("Configuration saved!");
    actions.setSubmitting(false);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {props => (
        <View style={css(ruleForm)}>
          <View className={css(ruleFieldContainer)}>
            <Field
              name="SERVER_URL"
              placeholder="https://svet.iakov.me"
              textContentType="url"
              {...props}
            />
            <Field
              name="BASIC_LOGIN"
              placeholder="iakov"
              textContentType="username"
              {...props}
            />
            <Field
              name="BASIC_PASSWORD"
              placeholder="s3cr3t"
              textContentType="password"
              secureTextEntry={true}
              {...props}
            />
          </View>
          <View style={css(ruleButtonContainer)}>
            <Button
              onPress={props.handleSubmit}
              loading={props.isSubmitting}
              disabled={props.isSubmitting}
              type="submit"
            >
              <Text>Save</Text>
            </Button>
            <Button
              onPress={props.handleReset}
              disabled={props.isSubmitting}
              type="reset"
              icon
            >
              <Feather name="delete" />
            </Button>
          </View>
        </View>
      )}
    </Formik>
  );
};
