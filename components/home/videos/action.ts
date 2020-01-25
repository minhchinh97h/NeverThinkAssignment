import {Action_updateCurrentVideoId} from 'interfaces';

export const updateCurrentVideoId: (
  c: string,
) => Action_updateCurrentVideoId = (current_video_id: string) => ({
  type: 'UPDATE_CURRENT_VIDEO_ID',
  current_video_id,
});
