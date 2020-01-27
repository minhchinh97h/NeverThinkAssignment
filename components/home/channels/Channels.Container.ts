/* 
  Connector component 
*/

import {connect} from 'react-redux';
import Channels from './Channels';
import {rootReducerInterface} from '../../../interfaces';
import {updateCurrentChannelIndex} from './action';

const mapStateToProps = (state: rootReducerInterface) => ({
  channels: state.channels,
  current_channel_index: state.current_channel_index,
});

const mapDispatchToProps: (d: any) => any = (dispatch: any) => ({
  updateCurrentChannelIndex: (current_channel_index: number) =>
    dispatch(updateCurrentChannelIndex(current_channel_index)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Channels);
