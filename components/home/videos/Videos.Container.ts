/* 
  Connector component
*/

import {connect} from 'react-redux';
import Videos from './Videos';
import {rootReducerInterface, VideoHistoryInterface} from 'interfaces';
import {updateCurrentVideoId, updateVideoHistory} from './action';

const mapStateToProps: (s: rootReducerInterface) => rootReducerInterface = (
  state: rootReducerInterface,
) => ({
  channels: state.channels,
  current_channel_index: state.current_channel_index,
  current_video_id: state.current_video_id,
  video_history: state.video_history,
});

const mapDispatchToProps: (d: any) => any = (dispatch: any) => ({
  updateCurrentVideoId: (current_video_id: string) =>
    dispatch(updateCurrentVideoId(current_video_id)),

  updateVideoHistory: (video_history: VideoHistoryInterface) =>
    dispatch(updateVideoHistory(video_history)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
