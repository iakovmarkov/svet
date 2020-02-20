import React from "react";
import { View } from "react-native";
import { Button, Icon } from "native-base";
import _ from "lodash/fp";
import { Row, Grid } from "react-native-easy-grid";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

import { AppContainer, AppHeader } from "../components/AppUI";
import { HomeScreenRow } from "../components/HomeScreenRow";

import colors from "../shared/colors";
import favorites from "../shared/favorites";

const query = gql`
  {
    recents {
      type
      color
      gradient {
        from
        to
      }
    }
  }
`;

@graphql(query)
export class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      swatches: [],
      gradients: []
    };
  }

  componentDidMount() {
    this.setState({
      swatches: this.generateSwatches(),
      gradients: this.generateGradients()
    });
  }

  generateSwatches() {
    const type = "color";
    const swatches = _.pipe(
      _.sampleSize(20),
      _.map(({ color }) => ({ color, type }))
    )(colors);

    return swatches;
  }

  generateGradients() {
    const type = "gradient";
    const gradients = _.pipe(
      _.sampleSize(40),
      _.chunk(2),
      _.map(([from, to]) => ({
        type,
        gradient: {
          from: from.color,
          to: to.color,
        }
      }))
    )(colors);

    return gradients;
  }

  render() {
    const viewStyle = { flex: 1 };
    const { swatches, gradients } = this.state;
    const { data: { recents = [], loading } } = this.props

    const content = (
      <Grid>
        <Row>
          <HomeScreenRow title="Favorites" colors={favorites} />
        </Row>
        <Row>
          <HomeScreenRow
            title="Recents"
            colors={recents}
            loading={loading}
          />
        </Row>
        <Row>
          <HomeScreenRow
            title="Swatches"
            colors={swatches}
            button={
              <Button
                small
                transparent
                onPress={() => {
                  const swatches = this.generateSwatches();

                  this.setState({ swatches });
                }}
              >
                <Icon name="shuffle" />
              </Button>
            }
          />
        </Row>
        <Row>
          <HomeScreenRow
            title="Gradients"
            colors={gradients}
            button={
              <Button
                small
                transparent
                onPress={() => {
                  const gradients = this.generateGradients();

                  this.setState({ gradients });
                }}
              >
                <Icon name="shuffle" />
              </Button>
            }
          />
        </Row>
      </Grid>
    );

    return (
      <AppContainer>
        <AppHeader>Svet Home</AppHeader>
        <View style={viewStyle}>{content}</View>
      </AppContainer>
    );
  }
}
