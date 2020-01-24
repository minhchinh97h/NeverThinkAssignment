export interface ChannelInterface {
  id: number;
  name: string;
  icon: string;
  playlist: string[];
}

export interface rootReducerInterface {
  channels: Array<ChannelInterface>;
  current_channel: string;
  video_data: any;
  current_video_id: string;
  current_video_index_in_channel_playlist: number;
}
