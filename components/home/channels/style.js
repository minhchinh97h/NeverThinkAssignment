import {StyleSheet} from 'react-native';
import {colors} from '../../../style';
export default style = StyleSheet.create({
  channels_container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },

  channels_flatlist_container: {
    paddingVertical: 11,
    flex: 1,
  },

  channel_container: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },

  channel_title: {
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: -0.02,
    color: 'white',
  },
});
