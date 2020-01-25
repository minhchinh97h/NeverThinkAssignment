import {combineReducers} from 'redux';
import {channels, current_channel} from './channels';
import {video_history, current_video_id} from './videos';

const rootReducer = combineReducers({
  channels,
  current_channel,
  video_history,
  current_video_id,
});

export default rootReducer;
