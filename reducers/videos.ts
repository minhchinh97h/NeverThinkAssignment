import {
  VideoHistoryInterface,
  Action_updateCurrentVideoId,
  Action_updateVideoHistory,
} from 'interfaces';

let initial_video_history: Array<VideoHistoryInterface> = [];

export const video_history = (
  state = initial_video_history,
  action: Action_updateVideoHistory,
) => {
  switch (action.type) {
    case 'UPDATE_VIDEO_HISTORY':
      let s = state;
      let index = s.findIndex(
        (history: VideoHistoryInterface) =>
          history.id === action.video_history.id,
      );

      if (index === -1) {
        s = s.concat(action.video_history);
      } else {
        s[index] = action.video_history;
        s = [...s];
      }

      return s;

    default:
      return state;
  }
};

export const current_video_id = (
  state = '',
  action: Action_updateCurrentVideoId,
) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_VIDEO_ID':
      return action.current_video_id;

    default:
      return state;
  }
};
