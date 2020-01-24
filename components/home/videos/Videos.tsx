import React, { RefObject } from "react"
import { View, FlatList, Text, Dimensions, Image, TouchableOpacity } from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../config/index"
import { ChannelInterface } from "../../../interfaces"
import style from "./style"
import Youtube from "react-native-youtube"
import axios from "axios"

const window_width: number = Dimensions.get("window").width

const youtube_instance_height: number = 300
const video_component_margin_vertical: number = 20
const video_component_total_height: number = youtube_instance_height + video_component_margin_vertical * 2

// Interface for component Videos's state
interface VideosState {
    should_flatlist_update: number,
    current_video_index: number,
    last_video_index: number
}

export default class Videos extends React.PureComponent<any, VideosState> {

    flatlist_ref: any = React.createRef()

    state: VideosState = {
        should_flatlist_update: 0, // Counting flag to update Flatlist when necessary
        current_video_index: 0, // Currently chosen video index in chosen channel's playlist.
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

    _keyExtractor = (item: string, index: number) => `videos-section-playlist-videoid-${item}-index-${index}`

    _renderItem: any = ({ item, index }: { item: string, index: number }) => (
        <Video
            videoId={item}
            index={index}

            video_data={this.props.video_data}
            video_info={this.props.video_data.item}
            current_video_id={this.props.current_video_id}
            updateCurrentVideoId={this.props.updateCurrentVideoId}

            _scrollToVideo={this._scrollToVideo}
            updateCurrentVideoIndexInChannelPlaylist={this.props.updateCurrentVideoIndexInChannelPlaylist}
            current_video_index_in_channel_playlist={this.props.current_video_index_in_channel_playlist}

            playlist={this.props.channels[this.props.current_channel].playlist}
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
        if (this.props.current_channel !== prevProps.current_channel) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1,
            }), () => {
                this._scrollToVideo(0)
            })
        }
    }

    render() {
        return (
            <View
                style={style.container}
            >
                <FlatList
                    data={this.props.channels[this.props.current_channel].playlist} // the playlist of each currently used channel is the Flatlist's data.
                    // Using this syntax for re-rendering whenever users change channel.
                    extraData={this.state.should_flatlist_update}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    windowSize={3}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    getItemLayout={this._getItemLayout}
                    ref={this.flatlist_ref}
                    initialScrollIndex={0}
                />
            </View>
        )
    }
}

// Interface for component Video's props
interface VideoProps {
    videoId: string,
    index: number,
    video_data: any,
    video_info: any,
    current_video_id: string,
    updateCurrentVideoId: (s: string) => any,
    _scrollToVideo: (i: number) => void,
    updateCurrentVideoIndexInChannelPlaylist: (n: number) => any,
    current_video_index_in_channel_playlist: number,
    playlist: string[]
}

// Interface for component Video's state
interface VideoState {
    status: string,
    thumbnail: string,
    video_snippet: any,
    should_play_youtube_instance: boolean,
    quality: any,
}

class Video extends React.PureComponent<VideoProps, VideoState> {

    // Reference of Youtube instance to use react-native-youtube's methods
    youtube_ref: any = React.createRef()

    // Used to get rid of memory leak warning when fetching promises while the component is unmounted
    mounted = false

    state: VideoState = {
        status: "stopped", // Capture the status of currently mounted Youtube instance
        thumbnail: "", // The thumnail url to mimic multiple Youtube players in Android 
        // since react-native-youtube for Android is singleton.
        video_snippet: {}, // Hold the video's information such as title, description, thumbnails, etc
        // via axios call to mimic multiple Youtube players in Android.
        should_play_youtube_instance: false, // Controll the play/pause function of Youtube instance.
        quality: "" // Capture the quality of the Youtube instance (currently unused).
    }

    // Event of Youtube Instance <Youtube /> to capture the instance's state
    _onChangeState = async (e: any) => {
        // this.setState({
        //     status: e.state
        // })

        // Get state of currently played Youtube Instance: stopped, loading, started, seeking - current time, buffering, playing, paused
        let { state } = e

        // Video ends.
        // When Youtube Instance ended, we play the next video based on the current_video_index_in_channel_playlist prop.
        // If it = playlist.length -1 (last index), we play the first.
        // Else we play the next video.
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
                }
            }

            catch (err) {
                // HANDLER ERROR
            }
        }
        // Video is playing
        else if (state === "playing") {

        }
        // Video starts. 
        else if (state === "started") {
            // When Youtube Instance started, we update its index in the current channel's playlist to
            // keep track of playing the next video.
            // this.props.updateCurrentVideoIndexInChannelPlaylist(this.props.index)
        }
    }

    // Function is invoked when the Youtube Instance ended to play the next video in the current channel's playlist
    _playNextVideoInPlaylist = () => {
        let { playlist, videoId } = this.props
        //Retrieve playlist's length
        let playlist_length: number = playlist.length

        let current_video_index = playlist.findIndex((video_id: string, index: number) => {
            return video_id === videoId
        })

        // If the ended video is not the last one in the playlist, we proceed to next video
        if (current_video_index < (playlist_length - 1)) {
            let next_video_index_in_channel_playlist: number = current_video_index + 1

            // To be able to mount the next video's Youtube Instance, we need to update the current_video_id prop.
            // Lets find its video id first then update through Redux action later.
            let next_video_id: string = playlist[next_video_index_in_channel_playlist]

            // Scroll to the video first to avoid UNAUTHORIZED_OVERLAY
            this.props._scrollToVideo(next_video_index_in_channel_playlist)

            // Update current_video_id
            this.props.updateCurrentVideoId(next_video_id)

            // Update current_video_index_in_channel_playlist to keep track of onplaying video
            // this.props.updateCurrentVideoIndexInChannelPlaylist(next_video_index_in_channel_playlist)
        }

        // If the ended video is the last one in the playlist, we proceed to the first video.
        else {
            let first_video_id: string = playlist[0]

            // Scroll to the video first to avoid UNAUTHORIZED_OVERLAY
            this.props._scrollToVideo(0)

            // Update current_video_id
            this.props.updateCurrentVideoId(first_video_id)
        }
    }

    // Event of Youtube Instance <Youtube /> to capture its quality
    _onChangeQuality = (e: any) => {
        this._stopYoutubeInstance()

        this.setState({
            quality: e.quality
        })
    }

    // Event of Youtube Instance <Youtube />
    _onReady = (e: any) => {
        // Start playing video whenever the Youtube Instance is mounted and ready.
        this._playYoutubeInstance()
    }

    // Event of Youtube Instance <Youtube />
    _onError = (e: any) => {
        // HANDLE ERRORS
    }

    // Get the current time of the Youtube instance when called (this is a promise)
    _returnCurrentTimeOfPlayedVideo = () => {
        return this.youtube_ref.current.getCurrentTime()
    }

    // Get the duration of the Youtube instance when called (this is a promise)
    _returnDurationOfPlayedVideo = () => {
        return this.youtube_ref.current.getDuration()
    }

    // Play the Youtube Instance
    _playYoutubeInstance = () => {
        this.youtube_ref.current.seekTo(0)

        this.setState({
            should_play_youtube_instance: true
        })
    }

    // Stop the Youtube Instance
    _stopYoutubeInstance = () => {
        this.setState({
            should_play_youtube_instance: false
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
        this.props.updateCurrentVideoId(this.props.videoId)

        this.props._scrollToVideo(this.props.index)
    }

    componentDidMount() {
        this.mounted = true
        this._getVideoInfo(this.props.videoId)
    }

    componentWillUnmount() {
        this.mounted = false

        // When using Flatlist, Video components will be unmounted when its view is outside the main screen view.
        // This will also raise an error called "UNAUTHORIZED_OVERLAY" in Android since Android's Youtube API doesn't 
        // support overlay or small rendering.
        // Normally when the error is raised, the video will stop but the stopping procedure doesn't proceed quickly enough
        // so we will stop the Youtube instance manually by adding this below function.
        this._stopYoutubeInstance()
    }

    render() {
        return (
            <View style={{
                marginVertical: video_component_margin_vertical,
                marginHorizontal: 22,
            }}>

                {/* Only mount the Youtube instance if the current video id (which is pressed on image) is the same
                    as the video id of Video component. By this way, we ensure there is only 1 Youtube Instance at a time
                    in Android */}
                {this.props.videoId === this.props.current_video_id ?
                    < Youtube
                        style={{
                            flex: 1,
                            height: youtube_instance_height,
                        }}
                        apiKey={GOOGLE_API_KEY_YOUTUBE}
                        videoId={this.props.videoId}
                        onChangeState={this._onChangeState}
                        onChangeQuality={this._onChangeQuality}
                        ref={this.youtube_ref}
                        onReady={this._onReady}
                        onError={this._onError}
                        play={this.state.should_play_youtube_instance}
                    />

                    :

                    /* Display the thumbnail if the condition returns false for pressing */
                    <TouchableOpacity
                        onPress={this._onPressImage}
                    >
                        {this.state.thumbnail.length > 0 && (
                            <Image
                                source={{ uri: this.state.thumbnail }}
                                style={{
                                    flex: 1,
                                    height: youtube_instance_height
                                }}
                            />
                        )}
                    </TouchableOpacity>
                }

                {/* <View
                    style={{
                        backgroundColor: "white",
                        paddingVertical: 12,
                        paddingHorizontal: 22,
                    }}
                >
                    <View>
                        <Text>
                            {this.state.video_snippet.title}
                        </Text>
                    </View>
                </View> */}
            </View>
        )
    }
}