import {connect} from 'react-redux';
import Channels from './Channels';

const mapStateToProps = (state: any) => ({
  channels: state['channels'],
});

export default connect(mapStateToProps, null)(Channels);
