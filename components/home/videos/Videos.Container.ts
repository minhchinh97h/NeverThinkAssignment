import {connect} from 'react-redux';
import Videos from './Videos';
import {rootReducerInterface} from 'interfaces';

const mapStateToProps = (state: rootReducerInterface) => ({
  channels: state.channels,
  current_channel: state.current_channel,
});

export default connect(mapStateToProps, null)(Videos);
