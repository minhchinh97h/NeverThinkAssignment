import { connect } from "react-redux";
import Main from "./Home";

const mapStatetoProps = (state: any, ownProps: any) => ({
    channels: state["channels"]
})

export default connect(mapStatetoProps, null)(Main)