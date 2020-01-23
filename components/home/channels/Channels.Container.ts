import {connect} from 'react-redux';
import Channels from './Channels';
import {rootReducerInterface} from '../../../interfaces';
import {updateCurrentChannel} from './action';

const mapStateToProps = (state: rootReducerInterface) => ({
  channels: state.channels,
  current_channel: state.current_channel,
});

const mapDispatchToProps = (dispatch: any) => ({
  updateCurrentChannel: (current_channel: number) =>
    dispatch(updateCurrentChannel(current_channel)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Channels);
