import React from "react";
import { View} from "react-native";
import { Button, Icon } from "native-base";
import _ from "lodash/fp";
import { Row, Grid } from "react-native-easy-grid";

import { AppContainer, AppHeader } from "../components/AppUI";
import { HomeScreenRow } from "../components/HomeScreenRow";

import colors from "../shared/colors";

const favorites = [
  { type: 'color', code: "FFFFF0", name: "Ivory" },
  { type: 'color', code: "660099", name: "Purple" },
  { type: 'color', code: "008080", name: "Teal" },
  { type: 'color', code: "240A40", name: "Violet" },
  { type: 'color', code: "FF8C69", name: "Salmon" },
  { type: 'color', code: "A6A29A", name: "Dawn" },
  { type: 'color', code: "BFFF00", name: "Lime" },
  { type: 'color', code: "FD0E35", name: "Torch Red" },
  { type: 'color', code: "BA450C", name: "Rock Spray" }
];

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
      swatches: this._generateSwatches(),
      gradients: this._generateGradients()
    });
  }

  _generateSwatches() {
    const type = 'color'
    const swatches = _.pipe(
      _.sampleSize(20),
      _.map(([code, name]) => ({ code, name, type }))
    )(colors);

    return swatches;
  }

  _generateGradients() {
    const type = 'gradient'
    const gradients = _.pipe(
      _.sampleSize(20),
      _.map(([code, name]) => ({ code, name, type }))
    )(colors);

    return [];
  }

  render() {
    const viewStyle = { flex: 1 };
    const { swatches, gradients } = this.state;

    const content = (
      <Grid>
        <Row>
          <HomeScreenRow title="Favorites" colors={favorites} />
        </Row>
        <Row>
          <HomeScreenRow
            title="Recents"
            button={
              <Button
                small
                transparent
                onPress={() => {
                  console.warn("nyi");
                }}
              >
                <Icon name="trash" />
              </Button>
            }
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
                  const swatches = this._generateSwatches();

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
                  const gradients = this._generateGradients();

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
