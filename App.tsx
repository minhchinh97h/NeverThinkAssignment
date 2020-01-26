import React from 'react';
import {
  View,
  StatusBar,
} from 'react-native';
import { getStatusBarHeight } from "react-native-status-bar-height"
import { createAppContainer } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack";
import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import Home from "./components/home/Home.Container";

const STATUS_BAR_HEIGHT = getStatusBarHeight()
const store = createStore(rootReducer)

export default class App extends React.PureComponent {
  render() {
    return (
      <Provider store={store}>
        <StatusBar barStyle="light-content" animated={true} />

        <AppContainer />

      </Provider>
    );
  }
};

const MainNavigator = createStackNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      header: () => null
    }
  }
})

const AppContainer = createAppContainer(MainNavigator)
