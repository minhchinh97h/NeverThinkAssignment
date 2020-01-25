export interface ChannelInterface {
  id: number;
  name: string;
  icon: string;
  playlist: string[];
}

export interface rootReducerInterface {
  channels: Array<ChannelInterface>;
  current_channel_index: number;
  video_history: any;
  current_video_id: string;
}

export interface VideoHistoryInterface {
  id: string;
  current_video_time: number;
  seen: boolean;
}

export interface Action_updateCurrentChannel {
  type: 'UPDATE_CURRENT_CHANNEL_INDEX';
  current_channel_index: number;
}

export interface Action_updateCurrentVideoId {
  type: 'UPDATE_CURRENT_VIDEO_ID';
  current_video_id: string;
}

export interface Action_updateVideoHistory {
  type: 'UPDATE_VIDEO_HISTORY';
  video_history: VideoHistoryInterface;
}
