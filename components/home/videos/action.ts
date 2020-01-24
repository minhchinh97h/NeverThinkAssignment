export const updateCurrentVideoId = (current_video_id: string) => ({
  type: 'UPDATE_CURRENT_VIDEO_ID',
  current_video_id,
});

export const updateCurrentVideoIndexInChannelPlaylist = (
  current_video_index_in_channel_playlist: number,
) => ({
  type: 'UPDATE_CURRENT_VIDEO_INDEX_IN_CHANNEL_PLAYLIST',
  current_video_index_in_channel_playlist,
});
