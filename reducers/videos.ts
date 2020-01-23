let initial_video_data = {};

export const video_data = (state = initial_video_data, action:any) => {
  switch (action.type) {
    case 'UPDATE_VIDEO_DATA':
      return action.video_data;

    default:
      return state;
  }
};

export const current_video_id = (state = '', action:any) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_VIDEO_ID':
      return action.current_video_id;

    default:
      return state;
  }
};
