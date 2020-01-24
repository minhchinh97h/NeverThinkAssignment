import {combineReducers} from 'redux';
import {channels, current_channel} from './channels';
import {
  video_data,
  current_video_id,
  current_video_index_in_channel_playlist,
} from './videos';

const rootReducer = combineReducers({
  channels,
  current_channel,
  video_data,
  current_video_id,
  current_video_index_in_channel_playlist,
});

export default rootReducer;
