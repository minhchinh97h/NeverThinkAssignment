import {connect} from 'react-redux';
import Videos from './Videos';
import {rootReducerInterface} from 'interfaces';
import {
  updateCurrentVideoId,
  updateCurrentVideoIndexInChannelPlaylist,
} from './action';

const mapStateToProps = (state: rootReducerInterface) => ({
  channels: state.channels,
  current_channel: state.current_channel,
  current_video_id: state.current_video_id,
  video_data: state.video_data,
  current_video_index_in_channel_playlist:
    state.current_video_index_in_channel_playlist,
});

const mapDispatchToProps = (dispatch: any) => ({
  updateCurrentVideoId: (current_video_id: string) =>
    dispatch(updateCurrentVideoId(current_video_id)),
  
  updateCurrentVideoIndexInChannelPlaylist: (
    current_video_index_in_channel_playlist: number,
  ) =>
    dispatch(
      updateCurrentVideoIndexInChannelPlaylist(
        current_video_index_in_channel_playlist,
      ),
    ),
});

export default connect(mapStateToProps, mapDispatchToProps)(Videos);
