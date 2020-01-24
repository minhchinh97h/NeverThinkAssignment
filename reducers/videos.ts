let initial_video_data = {};

export const video_data = (state = initial_video_data, action: any) => {
  switch (action.type) {
    case 'UPDATE_VIDEO_DATA':
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

export const current_video_index_in_channel_playlist = (
  state = 0,
  action: any,
) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_VIDEO_INDEX_IN_CHANNEL_PLAYLIST':
      return action.current_video_index_in_channel_playlist;

    default:
      return state;
  }
};
