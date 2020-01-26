import {StyleSheet} from 'react-native';
import {colors} from '../../../style';

export default style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    overflow: "hidden",
  },

  video_title: {
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: -0.02,
    color: colors.primary
  },

  video_watched_text: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.02,
    color: colors.subject,
  }
});
