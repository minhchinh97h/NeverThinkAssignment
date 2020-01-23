import {connect} from 'react-redux';
import Videos from './Videos';
import {rootReducerInterface} from 'interfaces';

const mapStateToProps = (state: rootReducerInterface) => ({
  channels: state['channels'],
});

export default connect(mapStateToProps, null)(Videos);
