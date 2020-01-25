import {combineReducers} from 'redux';
import {channels, current_channel_index} from './channels';
import {video_history, current_video_id} from './videos';

const rootReducer = combineReducers({
  channels,
  current_channel_index,
  video_history,
  current_video_id,
});

export default rootReducer;
