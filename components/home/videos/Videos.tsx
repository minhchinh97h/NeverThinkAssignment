import React from "react"
import { View, FlatList, Text, Dimensions, Image, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../config/index"
import { ChannelInterface, VideoHistoryInterface, Action_updateCurrentVideoId, Action_updateVideoHistory } from "../../../interfaces"
import style from "./style"
import Youtube from "react-native-youtube"
import axios from "axios"

const window_width: number = Dimensions.get("window").width
const window_height: number = Dimensions.get("window").height

const youtube_instance_height: number = 301
const video_information_section_height: number = 50
const video_component_margin_vertical: number = 20
const video_component_total_height: number = youtube_instance_height + video_component_margin_vertical * 2 + video_information_section_height // This variable
// plays an important role in helping the app avoiding the bad effects of "UNAUTHORIZED_OVERLAY" and "The Youtube Instance has released" since it
// makes only 1 video in the view area so only that video will mount the Youtube Instance. Thus, the height of the Youtube Instance is important due to
// the reason that if its is low, then the Youtube Instance will take less time to unmount when scrolling.

// Interface for component Videos's state
interface VideosState {
    should_flatlist_update: number,
    current_video_index: number,
    last_video_index: number
}

interface VideosProps {
    channels: Array<ChannelInterface>,
    current_channel_index: number,
    current_video_id: string,
    video_history: Array<VideoHistoryInterface>,
    updateCurrentVideoId: (s: string) => Action_updateCurrentVideoId,
    updateVideoHistory: (v: VideoHistoryInterface) => Action_updateVideoHistory
}

export default class Videos extends React.PureComponent<VideosProps, VideosState> {

    flatlist_ref: any = React.createRef()

    viewabilityConfig = {
        viewAreaCoveragePercentThreshold: 95
    }

    state: VideosState = {
        should_flatlist_update: 0, // Counting flag to update Flatlist when necessary
        current_video_index: -1, // Currently chosen video index in chosen channel's playlist.
        // Use this to help scrolling to the clicked video.
        // It will be set to 0 (first video) when choosing a new channel.
        last_video_index: -1
    }

    // Draw the pressed or focused Youtube Instance view to the users
    _scrollToVideo = (index: number) => {
        if (this.flatlist_ref.current && this.flatlist_ref.current.scrollToOffset) {
            this.flatlist_ref.current.scrollToOffset({
                offset: index * video_component_total_height,
                animated: true
            });
        }
    }

    // For better performance and to be able to use some Flatlist's props and methods
    _getItemLayout = (data: string[] | null, index: number) => ({
        length: video_component_total_height,
        offset: video_component_total_height * index,
        index
    })

    // Currently the App will crash when we create a Youtube Instance, scroll down from it, and then scroll back to it (this phase will crash the
    // app). To fix this bug, we determine the currently focused video by this below function so when a video is out of the main screen (will unmount),
    // we will delete its Youtube Instance since before the component unmounts completely, it will re-render at least one more time. Plus, the focused
    // video will be played like Facebook's Watch Video feature.
    // Since a video will take a big space, it will be easier for React Native to calculate the unmount/mount area so we will not likely 
    // encounter crashes or error "The Youtube Instance has been released" =>  consider this is a hack without using the prop resumePlayAndroid on 
    // <Youtube /> since the video will have black screen and be unable to play/pause anymore.
    _onViewableItemsChanged = ({ viewableItems }: any) => {
        if (viewableItems[0]) {
            this.setState({
                current_video_index: viewableItems[0].index
            })
        }
    }

    _keyExtractor = (item: string, index: number) => `videos-section-playlist-videoid-${item}-index-${index}`

    _renderItem: any = ({ item, index }: { item: string, index: number }) => (
        <Video
            videoId={item}
            index={index}

            video_history={this.props.video_history}
            current_video_id={this.props.current_video_id}
            updateCurrentVideoId={this.props.updateCurrentVideoId}

            _scrollToVideo={this._scrollToVideo}

            playlist={this.props.channels[this.props.current_channel_index].playlist}

            current_video_index={this.state.current_video_index}

            updateVideoHistory={this.props.updateVideoHistory}
        />
    )

    componentDidUpdate(prevProps: any, prevState: VideosState) {
        // The mounting of Youtube instance is based on this.props.current_video_id.
        // Therefore, the Flatlist should be updated due to this reason.
        if (this.props.current_video_id !== prevProps.current_video_id) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1,
            }))
        }

        // When changing the channel, the first video of the channel's playlist will be focused.
        if (this.props.current_channel_index !== prevProps.current_channel_index) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1,
            }), () => {
                this._scrollToVideo(0)
            })
        }

        // Update Flatlist when the currently focused video is changed.
        if (this.state.current_video_index !== prevState.current_video_index) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1,
            }))
        }
    }

    render() {
        return (
            <View
                style={style.container}
            >
                <FlatList
                    data={this.props.channels[this.props.current_channel_index].playlist} // the playlist of each currently used channel is the Flatlist's data.
                    // Using this syntax for re-rendering whenever users change channel.
                    extraData={this.state.should_flatlist_update}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    windowSize={7}
                    initialNumToRender={7}
                    maxToRenderPerBatch={7}
                    getItemLayout={this._getItemLayout}
                    ref={this.flatlist_ref}
                    initialScrollIndex={0}
                    viewabilityConfig={this.viewabilityConfig} // The property plays an important role in helping the App avoiding the bad effects of
                    // "UNAUTHORIZED_OVERLAY" and "The Youtube Instance has released" errors since it makes components unmount quicker => Youtube Instance unmount
                    // quicker.
                    onViewableItemsChanged={this._onViewableItemsChanged}
                />
            </View>
        )
    }
}

// Interface for component Video's props
interface VideoProps {
    videoId: string,
    index: number,
    video_history: Array<VideoHistoryInterface>,
    // video_info: any,
    current_video_id: string,
    updateCurrentVideoId: (s: string) => Action_updateCurrentVideoId,
    _scrollToVideo: (i: number) => void,
    playlist: string[],
    current_video_index: number,
    updateVideoHistory: (v: VideoHistoryInterface) => Action_updateVideoHistory
}

// Interface for component Video's state
interface VideoState {
    status: string,
    thumbnail: string,
    video_snippet: any,
    should_play_youtube_instance: boolean,
}

class Video extends React.PureComponent<VideoProps, VideoState> {

    // Reference of Youtube instance to use react-native-youtube's methods
    youtube_ref: any = React.createRef()

    // This percentage determines the condition that allow a video to be marked as seen.
    // If video's current time/ video's duration >= 0.7 then it is seen.
    seen_min_percentage = 0.5

    // Used to get rid of memory leak warning when fetching promises while the component is unmounted
    mounted = false

    state: VideoState = {
        status: "stopped", // Capture the status of currently mounted Youtube instance
        thumbnail: "", // The thumnail url to mimic multiple Youtube players in Android 
        // since react-native-youtube for Android is singleton.
        video_snippet: {}, // Hold the video's information such as title, description, thumbnails, etc
        // via axios call to mimic multiple Youtube players in Android.
        should_play_youtube_instance: true, // Controll the play/pause function of Youtube instance.
    }

    // Event of Youtube Instance <Youtube /> to capture the instance's state
    _onChangeState = async (e: any) => {
        // this.setState({
        //     status: e.state
        // })

        // Get state of currently played Youtube Instance: stopped, loading, started, seeking - current time, buffering, playing, paused
        let { state } = e

        // Video ends.
        // When Youtube Instance ended, we play the next video.
        if (state === "stopped") {
            // There are 2 "stopped" state, one for the initialization and one for the ending of the video.
            // We need the latter one so we can compare the video's current playing time with its own duration
            // To see whether the video has ended or not.
            try {
                let current_video_time: number = await this._returnCurrentTimeOfPlayedVideo()
                let video_duration: number = await this._returnDurationOfPlayedVideo()

                // At the first stage (video initialization), both current_video_time and video_duration are equal to 0.
                if (current_video_time === video_duration && current_video_time > 0) {
                    this._playNextVideoInPlaylist()


                    // Record video into history.
                    // Only add video into history when the video stopped at phase 2 (ended) and we reset parameters to 0
                    // so later when users want to see the video again, it will start from 0 second.
                    this._recordVideoHistory(0, 0)
                }
            }

            catch (err) {
                this._recordVideoHistory(0, 0)
            }

        }
        // Video is playing
        else if (state === "playing") {

        }
        // Video paused.
        // We will record the video's playing data such as its id, current paused time, is the playing time is long enough
        // to consider a seen video
        else if (state === "paused") {
            try {
                let current_video_time: number = await this._returnCurrentTimeOfPlayedVideo()
                let video_duration: number = await this._returnDurationOfPlayedVideo()

                // Record video into history
                this._recordVideoHistory(current_video_time, video_duration)
            }

            catch (err) {
                // When video's current time or video's duration is undefined
                // Record video into history
                this._recordVideoHistory(0, 0)
            }
        }
        // Video starts. 
        else if (state === "started") {
        }
    }

    // Function is invoked when the Youtube Instance ended to play the next video in the current channel's playlist
    _playNextVideoInPlaylist = () => {
        let { playlist, videoId } = this.props
        // Retrieve playlist's length
        let playlist_length: number = playlist.length

        // Find the current video index based on the video's id in the channel's playlist.
        // No need for additional data structure for better performance since a playlist can contain up to a reasonal limit of videos
        // which is normally small (considering max 5000 videos, meaning 5000 items in array)
        let current_video_index_in_channel_playlist = playlist.findIndex((video_id: string) => {
            return video_id === videoId
        })

        // If the ended video is not the last one in the playlist, we proceed to next video
        if (current_video_index_in_channel_playlist < (playlist_length - 1)) {
            let next_video_index_in_channel_playlist: number = current_video_index_in_channel_playlist + 1

            // To be able to mount the next video's Youtube Instance, we need to update the current_video_id prop.
            // Lets find its video id first then update through Redux action later.
            let next_video_id: string = playlist[next_video_index_in_channel_playlist]

            // Scroll to the video first to avoid UNAUTHORIZED_OVERLAY
            this.props._scrollToVideo(next_video_index_in_channel_playlist)
        }

        // If the ended video is the last one in the playlist, we proceed to the first video.
        else {
            let first_video_id: string = playlist[0]

            // Scroll to the video first to avoid UNAUTHORIZED_OVERLAY
            this.props._scrollToVideo(0)
        }
    }

    // We add the video's record into Redux's store video_history array.
    _recordVideoHistory = (current_video_time: number, video_duration: number) => {
        let sending_obj: VideoHistoryInterface = {
            id: this.props.videoId,
            current_video_time,
            seen: false
        }

        // We checked if the video is previously seen
        let index = this.props.video_history.findIndex((history: VideoHistoryInterface) => history.id === this.props.videoId)

        let have_seen_before: boolean = this.props.video_history[index] ? this.props.video_history[index].seen : false

        // If it is, we don't change its "seen" flag
        if (have_seen_before) {
            sending_obj.seen = true
        }
        // If it is not, we consider the case when users reach the video's currently playing time allowed for "seen"
        else {
            if (current_video_time > 0 && video_duration > 0 && current_video_time / video_duration >= this.seen_min_percentage) {
                sending_obj.seen = true
            }
        }

        this.props.updateVideoHistory(sending_obj)
    }

    // Event of Youtube Instance <Youtube />
    _onReady = (e: any) => {
        // Start playing video whenever the Youtube Instance is mounted and ready.
        this._playYoutubeInstance()
    }

    // Event of Youtube Instance <Youtube />
    _onError = (e: any) => {
        // HANDLE ERRORS
        // We will encounter error "UNAUTHORIZED_LAYOUT" in Android. But it will be ignored due to current approach.
        // Normally the error will cause the Youtube Instance to be stall/unable to use, but this approach will netigate those
        // issues.
    }

    // Get the current time of the Youtube instance when called (this is a promise)
    _returnCurrentTimeOfPlayedVideo: () => number = () => {
        return this.youtube_ref.current.getCurrentTime()
    }

    // Get the duration of the Youtube instance when called (this is a promise)
    _returnDurationOfPlayedVideo: () => number = () => {
        return this.youtube_ref.current.getDuration()
    }

    // Play the Youtube Instance
    _playYoutubeInstance = () => {
        // We play/resume the Youtube Instance based on its record in video history (current video time)
        let index = this.props.video_history.findIndex((history: VideoHistoryInterface) => history.id === this.props.videoId)

        if (index > -1) {
            this.youtube_ref.current.seekTo(this.props.video_history[index].current_video_time)
        } else {
            this.youtube_ref.current.seekTo(0)
        }

        this.setState({
            should_play_youtube_instance: true
        })
    }

    // Check if the thumbnail's uri is a valid string since it maybe null or empty
    _checkIfThumbNailUriValid = (uri: string) => {
        if (uri.length > 0) {
            return true
        }

        return false
    }

    // Always use the highest resolution of thumbnail picture
    _returnHighestThumbnailRes = (thumbnails: any) => {
        // There are possibly 5 resolutions in total: maxres, standard, high, medium, default (highest -> lowest).
        // Repeatively check each resolution for its availability.
        let thumbnail_uri: string = thumbnails.maxres ? thumbnails.maxres.url : ""

        if (!this._checkIfThumbNailUriValid(thumbnail_uri)) {
            thumbnail_uri = thumbnails.standard ? thumbnails.standard.url : ""

            if (!this._checkIfThumbNailUriValid(thumbnail_uri)) {
                thumbnail_uri = thumbnails.high ? thumbnails.high.url : ""

                if (!this._checkIfThumbNailUriValid(thumbnail_uri)) {
                    thumbnail_uri = thumbnails.medium ? thumbnails.medium.url : ""

                    if (!this._checkIfThumbNailUriValid(thumbnail_uri)) {
                        thumbnail_uri = thumbnails.default ? thumbnails.default.url : ""
                    }
                }
            }
        }

        return thumbnail_uri
    }

    // Call this in ComponentDidMount() to initialize the video's snippet based on provided this.props.videoId
    _getVideoInfo = (videoId: string) => {
        // Using Youtube v3 API for retrieving video object.
        axios({
            method: "GET",
            url: "https://www.googleapis.com/youtube/v3/videos",
            params: {
                key: GOOGLE_API_KEY_YOUTUBE,
                part: "snippet",
                id: videoId
            }
        })
            .then((res) => {
                // Only proceed if the component is mounted to avoid memory leak
                if (this.mounted) {
                    let snippet = res.data.items[0].snippet

                    let thumbnail_uri: string = this._returnHighestThumbnailRes(snippet.thumbnails)

                    this.setState({
                        thumbnail: thumbnail_uri,
                        video_snippet: snippet
                    })
                }
            })
            .catch(err => {
                // HANDLE ERRORS
            })
    }

    // When pressing on the image (no Youtube Instance mounted), we update Redux's current_video_id reducer
    // with the component's videoId prop so the videoId becomes the current_video_id, which will be used to
    // activate Youtube Instance.
    _onPressImage = () => {
        // Scroll to the video first to avoid UNAUTHORIZED_OVERLAY.
        // The aim is to have the current video index in channel list = video's index, which means
        // this.props.current_video_index === this.props.index then follow the process in componentDidUpdate.
        this.props._scrollToVideo(this.props.index)
    }

    componentDidMount() {
        this.mounted = true
        this._getVideoInfo(this.props.videoId)
    }

    componentDidUpdate(prevProps: VideoProps, prevState: VideoState) {
        if (this.props.current_video_index !== prevProps.current_video_index) {
            if (this.props.current_video_index === this.props.index) {
                // Because the Youtube Instance can only mount when satisfying 2 conditions: 
                // 1. current video index in channel's play list === video's index (when video is focused/within the view area)
                // 2. current video id from Redux's store === video's id (current video id is used to keep track of current video 
                // with Youtube Instance mounted)
                // To avoid "UNAUTHORIZED_OVERLAY" error, which will make Youtube Instance stops right after clicking on Play button, 
                // We wait 1s to make sure the video is in the right view area (condition 1 verified), then we update the Redux's store
                // with video's id (condition 2 verified). This approach can also minimize the chance of encountering the error "The Youtube
                // Instance has released", which means there are too many loading Youtube Instance at the same time (since Android only allow one Instance
                // at a time).
                setTimeout(() => {
                    this.props.updateCurrentVideoId(this.props.videoId)
                }, 1000)
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false
    }

    render() {
        // Flag is used to determine whether to mount the Youtube Instance
        let should_render_youtube_instance = false

        // Only mount Youtube Instance when the video's id === the current video id from Redux store and the video is focused,
        // which means the video's index === the current video index prop
        if (this.props.current_video_index === this.props.index && this.props.videoId === this.props.current_video_id) {
            should_render_youtube_instance = true
        }

        return (
            <TouchableOpacity
                style={{
                    marginHorizontal: 22,
                    marginVertical: video_component_margin_vertical,
                }}

                onPress={this._onPressImage}
                disabled={should_render_youtube_instance}
            >

                {should_render_youtube_instance ?
                    < Youtube
                        style={{
                            flex: 1,
                            height: youtube_instance_height,
                        }}
                        apiKey={GOOGLE_API_KEY_YOUTUBE}
                        videoId={this.props.videoId}
                        onChangeState={this._onChangeState}
                        ref={this.youtube_ref}
                        onReady={this._onReady}
                        onError={this._onError}
                        play={this.state.should_play_youtube_instance}
                    />

                    :

                    /* Display the thumbnail if the condition returns false for pressing */
                    <View>
                        {this.state.thumbnail.length > 0 && (
                            <Image
                                source={{ uri: this.state.thumbnail }}
                                style={{
                                    flex: 1,
                                    height: youtube_instance_height
                                }}
                            />
                        )}
                    </View>
                }

                <View
                    style={{
                        backgroundColor: "white",
                        paddingVertical: 12,
                        paddingHorizontal: 22,
                        height: video_information_section_height,
                    }}
                >
                    <View>
                        <Text>
                            {this.state.video_snippet.title}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}