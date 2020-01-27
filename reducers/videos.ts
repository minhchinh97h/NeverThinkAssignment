import {
  VideoHistoryInterface,
  Action_updateCurrentVideoId,
  Action_updateVideoHistory,
} from 'interfaces';

let initial_video_history: Array<VideoHistoryInterface> = [];

// Keep all recorded histories of played videos, including its when should the video play again at the next play, is it seen
// and its id. Use this to determine "seen"/"unseen" videos so the app can show "unseen" ones to users.
export const video_history = (
  state = initial_video_history,
  action: Action_updateVideoHistory,
) => {
  switch (action.type) {
    // Make sure return an immutable array
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

// This is a mandatory condition for a Youtube Instance to be mounted. After the video is within the main view area of Flatlist,
// which means it is not overlayed by any other components (Channels bar component) or partly hidden, the Youtube Instance will be mounted
// after 1 second to avoid rendering Youtube Instance too fast causing "The youtube instance has released" error by updating this reducer.
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
