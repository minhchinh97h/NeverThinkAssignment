import React from 'react';
import {
  StatusBar,
} from 'react-native';
import { createAppContainer } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack";
import { createStore } from "redux";
import { Provider } from "react-redux";
import rootReducer from "./reducers";
import Home from "./components/home/Home";

const store = createStore(rootReducer)

/* There are no use of react-navigation at this stage of the application.
Just adding as a mandatory choice.*/
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
