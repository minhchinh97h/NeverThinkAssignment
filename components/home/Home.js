import React from 'react';
import {View} from 'react-native';
import Channels from './channels/Channels.Container';
import Videos from './videos/Videos.Container';

export default class Home extends React.PureComponent {
  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <Channels />
        <Videos />
      </View>
    );
  }
}
