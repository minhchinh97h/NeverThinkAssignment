import {Action_updateCurrentChannel} from 'interfaces';

export const updateCurrentChannel: (
  c: number,
) => Action_updateCurrentChannel = (current_channel_index: number) => ({
  type: 'UPDATE_CURRENT_CHANNEL_INDEX',
  current_channel_index,
});
