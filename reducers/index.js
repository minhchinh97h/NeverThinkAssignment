import {combineReducers} from 'redux';
import {channels, current_channel} from './channels';

const rootReducer = {
  channels,
  current_channel,
};

export default combineReducers(rootReducer);
