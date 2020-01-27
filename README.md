# NeverThinkAssignment

A React Native simple app that creates channels, playlists and videos with Youtube APIs.

## Main stacks and libraries
- React Native 0.61.5
- Typescript ^3.7.3
- react-native-youtube ^2.0.0
- redux ^4.0.5
- react-redux ^7.1.3

All packages can be found in `package.json`.

## Developing environment
- Android emulator
- Npm
- Virtual device: 5.4 FWVGA, API 29, target Android 10.0 (Google APIs), resolution: 480 x 854 mdpi

<strong>!IMPORTANT</strong>: It is worthy to note that the application has fixed styling for component's heights. Thus I encourage using the same virtual
device or devices with similar height to have the best testing experience.

## Installation
Make sure to follow <a href="https://facebook.github.io/react-native/docs/getting-started">React Native's Android installation guide.</a>

Install packages with the command:
```bash
$ npm install
```

Link packages with the command:
```bash
$ react-native link
```

Run the application on Android emulator with the command:
```bash
$ npx react-native run-android
```
## Notes from the application
- The first video of the first channel will be played when initializing the app.
- Implement all required features. All `unseen` videos will be prioritized to play first. 
- When the last video in the playlist ended, the first one will be played. After the first video ended, the next `unseen` video will be played. In the case when all videos are `seen`, proceed video-by-video normally.
- Videos will be played after 1 second to minimize the chance of encountering `UNAUTHORIZED_OVERLAY` and `The Youtube instance has released` errors, which will cause the app crash or malfunction.
- Videos can be resumed at when it paused. Only work when users intentionally pause a video, watch another video, then go back to the video and the video will resume at the paused seconds.
- The playing video will be unavailable when users scroll up/down to hide it. It will become available when users scroll to the video and make it `focused` (fully expose the video in the main view area, not partly hidden).

## Known issues
- Sometimes, the app will encounter the error `INTERNAL_ERROR` causing the Youtube player keep loading and end up in a black screen. It can be fixed by scrolling down to hide the first video, then scroll up again to force it mount the Youtube Instance. The error is known and caused by the Youtube APIs from react-native-youtube.
- When intensively combining scrolling the playlist/changing channels, the Youtube Instance will be malfunction causing the player pause right after playing despite none error being thrown. This behavior can be neglect by interacting the app at slow/normal pace (calmly).
In code, I can create the user gesture interaction handlers to deal with the situation but it is time-consuming and redundant at the moment.
