import {connect} from 'react-redux';
import Videos from './Videos';
import {rootReducerInterface} from 'interfaces';
import {updateCurrentVideoId} from './action';

const mapStateToProps: (s: rootReducerInterface) => rootReducerInterface = (
  state: rootReducerInterface,
) => ({
  channels: state.channels,
  current_channel: state.current_channel,
  current_video_id: state.current_video_id,
  video_history: state.video_history,
});

const mapDispatchToProps: (d: any) => any = (dispatch: any) => ({
  updateCurrentVideoId: (current_video_id: string) =>
    dispatch(updateCurrentVideoId(current_video_id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
