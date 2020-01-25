export interface ChannelInterface {
  id: number;
  name: string;
  icon: string;
  playlist: string[];
}

export interface rootReducerInterface {
  channels: Array<ChannelInterface>;
  current_channel: string;
  video_history: any;
  current_video_id: string;
}

export interface VideoHistoryInterface {
  id: string;
  current_video_time: number;
  seen: boolean;
}

export interface Action_updateCurrentChannel {
  type: 'UPDATE_CURRENT_CHANNEL';
  current_channel: number;
}

export interface Action_updateCurrentVideoId {
  type: 'UPDATE_CURRENT_VIDEO_ID';
  current_video_id: string;
}
