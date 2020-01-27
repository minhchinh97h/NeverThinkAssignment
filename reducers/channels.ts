import {ChannelInterface, Action_updateCurrentChannel} from '../interfaces';

let initial_channels: Array<ChannelInterface> = [
  {
    id: 1,
    name: 'Meme Radar',
    icon:
      'https://neverthink.tv/assets/images/63e3939725b3d92af5e7b8429a0f4d57e6be661abf380b39348f360e528dd6e2.png',
    playlist: [
      'QSqIG5Dl-SM',
      'jM0GePXOdT0',
      'exLTGu_c5fs',
      'Km8kIX-8hVs',
      'c9EOCt9kkUo',
      '-goTfMUabxc',
      'y7pZzp99Jgs',
      '85RhW75xM8U',
      'URLyBDYHoGo',
    ],
  },
  {
    id: 2,
    name: 'LOL',
    icon:
      'https://neverthink.tv/assets/images/61d1aeee19fd7cff13a8b17727f1b5a4e9645f16c42ff376a5e5f3ce8a373df2.png',
    playlist: [
      '_Czxy3nya8Y',
      'p8UR4dODogI',
      'HoL1csZPYsk',
      '8V0HETilr4I',
      'ADrBo7u3tR4',
      'BgZh5T4nG_w',
      'J3iSEq5Apfg',
      'iCc5l8iWUZs',
    ],
  },
  {
    id: 3,
    name: 'WTF',
    icon:
      'https://neverthink.tv/assets/images/fde01ee47dc02d83892c35c22f2efd81f52c37edc4f3651be40094a115c812fd.png',
    playlist: ['JZnlJ2upJv8', 'Km8kIX-8hVs', 'tHa260XXH6U'],
  },
];

// Used as a hard-code array of provided channel information for components to retrieve globally.
export const channels = (state = initial_channels, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

// Initially when the app starts, current_channel will be at 0 (zero-based) index of channels array, meaning the first channel.
// The reducer helps the app render correct channel playlists when navigating to.
export const current_channel_index = (
  state = 0,
  action: Action_updateCurrentChannel,
) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_CHANNEL_INDEX':
      return action.current_channel_index;

    default:
      return state;
  }
};
