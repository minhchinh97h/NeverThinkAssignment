import {
  Action_updateCurrentVideoId,
  Action_updateVideoHistory,
  VideoHistoryInterface,
} from 'interfaces';

// Action to update current_video_id reducer
export const updateCurrentVideoId: (
  c: string,
) => Action_updateCurrentVideoId = (current_video_id: string) => ({
  type: 'UPDATE_CURRENT_VIDEO_ID',
  current_video_id,
});

// Action to update video_history reducer
export const updateVideoHistory: (
  v: VideoHistoryInterface,
) => Action_updateVideoHistory = (video_history: VideoHistoryInterface) => ({
  type: 'UPDATE_VIDEO_HISTORY',
  video_history,
});
