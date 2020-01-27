import {Action_updateCurrentChannelIndex} from 'interfaces';

// Action to update current_channel_index reducer
export const updateCurrentChannelIndex: (
  c: number,
) => Action_updateCurrentChannelIndex = (current_channel_index: number) => ({
  type: 'UPDATE_CURRENT_CHANNEL_INDEX',
  current_channel_index,
});
