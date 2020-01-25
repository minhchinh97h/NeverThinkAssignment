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
  id: string
  current_video_time: number
  seen: boolean
}