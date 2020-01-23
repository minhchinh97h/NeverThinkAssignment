export interface ChannelInterface {
  id: number;
  name: string;
  icon: string;
  playlist: string[];
}

export interface rootReducerInterface {
  channels: Array<ChannelInterface>;
  current_channel: string;
}
