import React from "react"
import { View, FlatList, Text, Image, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../config/index"
import { ChannelInterface, VideoHistoryInterface, Action_updateCurrentVideoId, Action_updateVideoHistory } from "../../../interfaces"
import style from "./style"
import Youtube from "react-native-youtube"
import axios from "axios"

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
    should_display_flatlist: boolean,
    flatlist_data: Array<any>,
    should_load_activity_indicator: boolean
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
    start_index: number = -1

    recorded_video_index: number = -1

    _viewabilityConfig = {
        viewAreaCoveragePercentThreshold: 95
    }

    state: VideosState = {
        should_flatlist_update: 0, // Counting flag to update Flatlist when necessary
        current_video_index: -1, // Currently chosen video index in chosen channel's playlist.
        // Use this to help scrolling to the clicked video.
        // It will be set to 0 (first video) when choosing a new channel.
        should_display_flatlist: false,
        flatlist_data: [],
        should_load_activity_indicator: true
    }

    _changeChannelPlaylist = () => {
        this.setState({
            should_load_activity_indicator: true
        }, () => {
            this._updateFlatlistData()
        })
    }

    // Draw the pressed or focused Youtube Instance view to the users
    _scrollToVideo = (index: number) => {
        this.setState(prevState => ({
            current_video_index: index,
            should_flatlist_update: prevState.should_flatlist_update + 1
        }), () => {
            this.recorded_video_index = index

            if (this.flatlist_ref.current && this.flatlist_ref.current.scrollToOffset) {
                this.flatlist_ref.current.scrollToOffset({
                    offset: index * video_component_total_height,
                    animated: true
                });
            }
        })
    }

    // For better performance and to be able to use some Flatlist's props and methods
    _getItemLayout = (data: string[] | null, index: number) => ({
        length: video_component_total_height,
        offset: video_component_total_height * index,
        index
    })

    _onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        let { current_video_index } = this.state

        let flatlist_view_height = e.nativeEvent.layoutMeasurement.height

        // Check if the current video component's area intersect with outside of the main viewarea
        let y_top_offset = e.nativeEvent.contentOffset.y
        let y_bottom_offset = y_top_offset + flatlist_view_height
        let youtube_instance_y_top_offset = this.recorded_video_index * video_component_total_height + video_component_margin_vertical
        // let youtube_instance_y_top_offset = current_video_index * video_component_total_height
        let youtube_instance_y_bottom_offset = (this.recorded_video_index + 1) * video_component_total_height - video_component_margin_vertical

        // meaning the Youtube Instance is scrolled up => outside main view
        if (y_top_offset > youtube_instance_y_top_offset) {
            this.setState({
                current_video_index: -1
            })
        }
        // meaning the Youtube Instance is scrolled down => outside main view
        else if (y_bottom_offset < youtube_instance_y_bottom_offset) {
            this.setState({
                current_video_index: -1
            })
        } else {
            this.setState({
                current_video_index: this.recorded_video_index
            })
        }
    }

    // _keyExtractor = (item: string, index: number) => `videos-section-playlist-videoid-${item}-index-${index}`
    _keyExtractor = (item: any, index: number) => `videos-section-playlist-videoid-${item.videoId}-index-${index}`

    _renderItem: any = ({ item, index }: { item: any, index: number }) => (
        <Video
            videoId={item.videoId}
            thumbnail={item.thumbnail}
            video_snippet={item.video_snippet}
            index={index}
            video_history={this.props.video_history}
            current_video_id={this.props.current_video_id}
            updateCurrentVideoId={this.props.updateCurrentVideoId}
            _scrollToVideo={this._scrollToVideo}
            playlist={this.props.channels[this.props.current_channel_index].playlist}
            current_video_index={this.state.current_video_index}
            updateVideoHistory={this.props.updateVideoHistory}
            start_index={this.start_index}
        />
    )

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

    _callGetVideoObjectAsync = (videoId: string) => {
        // Using Youtube v3 API for retrieving video object.
        return axios({
            method: "GET",
            url: "https://www.googleapis.com/youtube/v3/videos",
            params: {
                key: GOOGLE_API_KEY_YOUTUBE,
                part: "snippet",
                id: videoId
            }
        })
            .then((res) => {
                let snippet = res.data.items[0].snippet
                let thumbnail_uri: string = this._returnHighestThumbnailRes(snippet.thumbnails)

                return ({
                    thumbnail: thumbnail_uri,
                    video_snippet: snippet,
                    videoId
                })
            })
            .catch(err => {
                // HANDLE ERRORS
                return ({
                    thumbnail: "",
                    video_snippet: {},
                    videoId
                })
            })
    }

    _callPromises = () => {
        let { current_channel_index, channels } = this.props
        let { playlist } = channels[current_channel_index]

        let promise_array = playlist.map((video_id: string) => this._callGetVideoObjectAsync(video_id))

        return Promise.all(promise_array)
    }

    _updateFlatlistData = async () => {
        this._findStartIndex()

        let flatlist_data: Array<any> = []

        try {
            flatlist_data = await this._callPromises()
        }
        catch (err) {
            // HANDLER ERRORS
            flatlist_data = []
        }

        this.setState({
            should_display_flatlist: false,
            current_video_index: this.start_index,
            flatlist_data,
            should_load_activity_indicator: false
        }, () => {
            this.setState({
                should_display_flatlist: true
            })
        })
    }

    _findStartIndex: () => void = () => {
        let { current_channel_index, video_history, channels } = this.props

        let channel_playlist = channels[current_channel_index].playlist

        this.start_index = 0

        channel_playlist.every((video_id: string, index: number) => {
            let index_in_video_history = video_history.findIndex((history: VideoHistoryInterface) => history.id === video_id)

            if (index_in_video_history > -1) {
                if (video_history[index_in_video_history].seen === false) {
                    this.start_index = index
                    return false
                }
                else {
                    return true
                }
            }
            else {
                this.start_index = index
                return false
            }
        })


        this.recorded_video_index = this.start_index
    }

    componentDidMount() {
        this._updateFlatlistData()
    }

    componentDidUpdate(prevProps: VideosProps, prevState: VideosState) {
        // The mounting of Youtube instance is based on this.props.current_video_id.
        // Therefore, the Flatlist should be updated due to this reason.
        if (this.props.current_video_id !== prevProps.current_video_id) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1,
            }))
        }

        // When changing the channel, we mount the new Flatlist with its initial scroll index to be the first unseen video.
        if (this.props.current_channel_index !== prevProps.current_channel_index) {
            this._changeChannelPlaylist()
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

                {this.state.should_load_activity_indicator ?
                    <View
                        style={{
                            marginTop: 20,
                        }}
                    >
                        <ActivityIndicator
                            size={"large"}
                            color={"white"}
                        />
                    </View>
                    :
                    <>
                        {this.state.should_display_flatlist ?
                            <FlatList
                                data={this.state.flatlist_data} // the playlist of each currently used channel is the Flatlist's data.
                                // Using this syntax for re-rendering whenever users change channel.
                                extraData={this.state.should_flatlist_update}
                                keyExtractor={this._keyExtractor}
                                renderItem={this._renderItem}
                                windowSize={11}
                                initialNumToRender={11}
                                maxToRenderPerBatch={11}
                                getItemLayout={this._getItemLayout}
                                ref={this.flatlist_ref}
                                initialScrollIndex={this.start_index}
                                viewabilityConfig={this._viewabilityConfig}
                                scrollEventThrottle={16}
                                onScroll={this._onScroll}
                            />
                            :
                            null
                        }
                    </>
                }
            </View>
        )
    }
}

// Interface for component Video's props
interface VideoProps {
    videoId: string,
    index: number,
    video_history: Array<VideoHistoryInterface>,
    current_video_id: string,
    updateCurrentVideoId: (s: string) => Action_updateCurrentVideoId,
    _scrollToVideo: (i: number) => void,
    playlist: string[],
    current_video_index: number,
    updateVideoHistory: (v: VideoHistoryInterface) => Action_updateVideoHistory,
    start_index: number,
    thumbnail: string,
    video_snippet: any,
}

// Interface for component Video's state
interface VideoState {
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
        should_play_youtube_instance: true, // Controll the play/pause function of Youtube instance.
    }

    // Event of Youtube Instance <Youtube /> to capture the instance's state
    _onChangeState = (e: any) => {
        // Get state of currently played Youtube Instance: stopped, loading, started, seeking - current time, buffering, playing, paused
        let { state } = e

        // Video ends.
        // When Youtube Instance ended, we play the next video.
        if (state === "stopped") {
            this._executeWhenVideoStopped()
        }
        // Video paused.
        // We will record the video's playing data such as its id, current paused time, is the playing time is long enough
        // to consider a seen video
        else if (state === "paused") {
            this._executeWhenVideoPaused()
        }
    }

    _executeWhenVideoStopped = async () => {
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
                this._recordVideoHistory(current_video_time, video_duration)
            }
        }

        catch (err) {
            this._recordVideoHistory(0, 0)
        }
    }

    _executeWhenVideoPaused = async () => {
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

    _returnNextUnseenVideoIndexRecursive: (v: string, i: number, pl: number) => number = (videoId: string, index: number, playlist_length: number) => {
        if (index === playlist_length - 1) {
            return -1
        }

        let { video_history, playlist } = this.props

        let video_history_index = video_history.findIndex((history: VideoHistoryInterface) => history.id === videoId)

        if (video_history_index === -1) {
            return index
        } else {
            let is_seen_video = video_history[video_history_index].seen
            if (is_seen_video) {
                let next_index = index + 1
                let next_video_id = playlist[next_index]
                return this._returnNextUnseenVideoIndexRecursive(next_video_id, next_index, playlist_length)
            } else {
                return index
            }
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

        let next_video_index_in_channel_playlist = current_video_index_in_channel_playlist + 1 === playlist_length ? 0 : current_video_index_in_channel_playlist + 1
        let next_video_id = playlist[next_video_index_in_channel_playlist]

        let next_unseen_video_index = this._returnNextUnseenVideoIndexRecursive(next_video_id, next_video_index_in_channel_playlist, playlist_length)

        if (next_unseen_video_index === - 1) {
            // Scroll to the video first to avoid UNAUTHORIZED_OVERLAY
            this.props._scrollToVideo(next_video_index_in_channel_playlist)
        } else {
            this.props._scrollToVideo(next_unseen_video_index)
        }
    }


    // We checked if the video is previously seen
    _checkIfVideoSeen:
        (c: number, v: number) => boolean
        = (current_video_time: number, video_duration: number) => {
            let seen = false
            let index = this.props.video_history.findIndex((history: VideoHistoryInterface) => history.id === this.props.videoId)
            let have_seen_before: boolean = this.props.video_history[index] ? this.props.video_history[index].seen : false

            // If it is, we don't change its "seen" flag
            if (have_seen_before) {
                seen = true
            }
            // If it is not, we consider the case when users reach the video's currently playing time allowed for "seen"
            else {
                if (current_video_time > 0
                    && video_duration > 0
                    && current_video_time / video_duration >= this.seen_min_percentage) {
                    seen = true
                }
            }

            return seen
        }

    // We add the video's record into Redux's store video_history array.
    _recordVideoHistory = (current_video_time: number, video_duration: number) => {
        let sending_obj: VideoHistoryInterface = {
            id: this.props.videoId,
            current_video_time,
            seen: this._checkIfVideoSeen(current_video_time, video_duration)
        }

        // If the video recorded as "stopped" by ending the video, we set the current_video_time to 0 to start play it again from the start.
        if (current_video_time > 0 && current_video_time === video_duration) {
            sending_obj.current_video_time = 0
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

        console.log(e)
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

        if (this.props.start_index === this.props.index) {
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

    componentDidUpdate(prevProps: VideoProps, prevState: VideoState) {
        if (this.props.current_video_index !== prevProps.current_video_index) {
            if (this.props.current_video_index === this.props.index) {
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

        let has_video_been_seen = this._checkIfVideoSeen(0, 0)
        let has_seen_text = has_video_been_seen ? "Watched" : ""

        return (
            <TouchableOpacity
                style={{
                    marginHorizontal: 22,
                    marginVertical: video_component_margin_vertical,
                }}

                onPress={this._onPressImage}
                disabled={should_render_youtube_instance}
            >
                <>
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
                            {this.props.thumbnail.length > 0 && (
                                <Image
                                    source={{ uri: this.props.thumbnail }}
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
                            paddingHorizontal: 12,
                            height: video_information_section_height,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View style={{
                            justifyContent: "center",
                            marginRight: 10,
                            flex: 1,
                        }}>
                            <Text style={style.video_title}>
                                {this.props.video_snippet.title}
                            </Text>
                        </View>

                        <View>
                            <Text style={style.video_watched_text}>
                                {has_seen_text}
                            </Text>
                        </View>
                    </View>
                </>
            </TouchableOpacity>
        )
    }
}