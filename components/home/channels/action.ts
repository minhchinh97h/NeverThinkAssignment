import {Action_updateCurrentChannel} from 'interfaces';

export const updateCurrentChannel: (
  c: number,
) => Action_updateCurrentChannel = (current_channel: number) => ({
  type: 'UPDATE_CURRENT_CHANNEL',
  current_channel,
});
