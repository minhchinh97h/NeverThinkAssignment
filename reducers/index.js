import {combineReducers} from 'redux';

import {channels} from './channels';

const rootReducer = {
  channels,
};

export default combineReducers(rootReducer);
