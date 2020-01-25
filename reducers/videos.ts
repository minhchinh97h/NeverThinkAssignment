import {VideoHistoryInterface} from 'interfaces';

let initial_video_history: Array<VideoHistoryInterface> = [];

export const video_history = (state = initial_video_history, action: any) => {
  switch (action.type) {
    case 'UPDATE_VIDEO_HISTORY':
      return action.video_data;

    default:
      return state;
  }
};

export const current_video_id = (state = '', action: any) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_VIDEO_ID':
      return action.current_video_id;

    default:
      return state;
  }
};
