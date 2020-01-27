import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../../../config"
import { VideoHistoryInterface, Action_updateCurrentVideoId, Action_updateVideoHistory } from "interfaces"
import Youtube from "react-native-youtube"
import { colors } from "../../../../../style"

interface VideoState {
    should_play_youtube_instance: boolean,
}

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
    youtube_instance_height: number,
    video_information_section_height: number,
    video_component_margin_vertical: number
}

// Video represents Youtube Instance when conditions are met and its thumbnail + title when conditions aren't.
export default class Video extends React.PureComponent<VideoProps, VideoState> {

    // Reference of Youtube instance to use react-native-youtube's methods
    youtube_ref: any = React.createRef()

    // This percentage determines the condition that allow a video to be marked as seen.
    // If video's current time/ video's duration >= the value then it is seen.
    seen_min_percentage = 0.5

    state: VideoState = {
        should_play_youtube_instance: true, // Controll the play/pause function of Youtube instance.
    }

    // Event of Youtube Instance <Youtube /> to capture the instance's state
    _onChangeState = (e: any) => {
        // Get state of currently played Youtube Instance: stopped, loading, started, seeking - current time, buffering, playing, paused
        let { state } = e

        // Video ends. Play the next video
        if (state === "stopped") {
            this._executeWhenVideoStopped()
        }
        // Video paused. Record the video's information such as the pausing time, its id and is it "seen"
        else if (state === "paused") {
            this._executeWhenVideoPaused()
        }
    }

    _executeWhenVideoStopped = async () => {
        /* There are 2 "stopped" state, one for the initialization and one for the ending of the video.
        We need the latter one so we can compare the video's current playing time with its own duration
        To see whether the video has ended or not. */
        try {
            let current_video_time: number = await this._returnCurrentTimeOfPlayedVideo()
            let video_duration: number = await this._returnDurationOfPlayedVideo()

            // At the first stage (video initialization), both current_video_time and video_duration are equal to 0.
            if (current_video_time === video_duration && current_video_time > 0) {
                // Play the next video on the playlist
                this._playNextVideoInPlaylist()

                // Record video into history.
                // Only add video into history when the video stopped at phase 2 (ended) and we reset parameters to 0
                // so later when users want to see the video again, it will start from 0 second. Video is seen.
                this._recordVideoHistory(current_video_time, video_duration)
            }
        }

        catch (err) {
            // Video is unseen, will start at 0 second when pressed play.
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
            // Video is unseen, will start at 0 second when pressed play.
            this._recordVideoHistory(0, 0)
        }
    }

    /* Recursively return the next unseen video. The process will work circularly at the last index and one-way at the rest, meaning it only return
    the next "unseen" video from top to bottom order. If there is none unseen video or reaching the end of the playlist, return -1 */
    _returnNextUnseenVideoIndexRecursive: (i: number, pl: number) => number = (current_index: number, playlist_length: number) => {
        /* Base case. Exit when reaching the end of the playlist. Return to the first video when the last video ended. After that, the 
        app will play the next unseen video if there is, or it will play video by video as normal. */
        if (current_index === playlist_length - 1) {
            return -1
        }

        let { video_history, playlist } = this.props
        let next_index = current_index + 1 === playlist_length ? 0 : current_index + 1
        let next_video_id = playlist[next_index]

        let video_history_index = video_history.findIndex((history: VideoHistoryInterface) => history.id === next_video_id)

        if (video_history_index === - 1) {
            return next_index
        } else {
            let is_seen_video = video_history[video_history_index].seen

            if (is_seen_video) {
                return this._returnNextUnseenVideoIndexRecursive(next_index, playlist_length)
            } else {
                return next_index
            }
        }
    }

    // Function is invoked when the Youtube Instance ended to play the next video in the current channel's playlist
    _playNextVideoInPlaylist = () => {
        let { playlist, videoId } = this.props
        // Retrieve playlist's length
        let playlist_length: number = playlist.length

        /* Find the current video index based on the video's id in the channel's playlist.
        No need for additional data structure for better performance since a playlist can contain up to a reasonal limit of videos
        which is normally small (considering max 5000 videos, meaning 5000 items in array) */
        let current_video_index_in_channel_playlist = playlist.findIndex((video_id: string) => {
            return video_id === videoId
        })

        // Get the next video index in playlist circularly.
        let next_video_index_in_channel_playlist = current_video_index_in_channel_playlist + 1 === playlist_length ? 0 : current_video_index_in_channel_playlist + 1

        // Get the next unseen video's index in playlist based on current video index in playlist. Return -1 if none.
        let next_unseen_video_index = this._returnNextUnseenVideoIndexRecursive(current_video_index_in_channel_playlist, playlist_length)

        if (next_unseen_video_index === - 1) {
            // Scroll to the next video circularly. Satisfy the first condition to render Youtube Instance.
            this.props._scrollToVideo(next_video_index_in_channel_playlist)
        } else {
            // Scroll to the next unseen video. Satisfy the first condition to render Youtube Instance.
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
        /* Sometimes when the app is initializing, we will encounter error "INTERNAL_ERROR" which will force
        manual activation by scroll away the video and come back.*/
        /* Currently, the errors "UNAUTHORIZED_OVERLAY" and "The Youtube Instance has released" are hardly visible, at least
        with my testing.*/
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

    // When pressing on the image (no Youtube Instance mounted), scroll to video to readily mount Youtube Instance.
    _onPressImage = () => {
        this.props._scrollToVideo(this.props.index)
    }

    componentDidMount() {
        // When the video component is mounted, we check whether it is the first video to play
        if (this.props.start_index === this.props.index) {
            /* Because the Youtube Instance can only mount when satisfying 2 conditions: 
            1. Video is pressed and within the main view area 
            (this.props.current_video_index === this.props.index or this.props.start_index === this.props.index)
            2. current video id from Redux's store === video's id (normally current_video_id reducer will be updated 
            with the video's id when its component is focused)
            
            We wait 1s to make sure the video is in the right view area (condition 1 verified), then we update the Redux's store
            with video's id (condition 2 verified). This approach can also minimize the chance of encountering the error "The Youtube
            Instance has released", which means there are too many loading Youtube Instance at the same time (since Android only allow one Instance
            at a time). */
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

    render() {
        // Flag is used to determine whether to mount the Youtube Instance
        let should_render_youtube_instance = false

        /* 
        Only mount the Youtube instance when 2 conditions are met: 
        1. video component is within the main view area (focused/pressed)
        2. its video's id equals to Redux's current_video_id reducer
        */
        if (this.props.current_video_index === this.props.index && this.props.videoId === this.props.current_video_id) {
            should_render_youtube_instance = true
        }

        let has_video_been_seen = this._checkIfVideoSeen(0, 0)
        let has_seen_text = has_video_been_seen ? "Watched" : ""

        return (
            <TouchableOpacity
                style={{
                    marginHorizontal: 22,
                    marginVertical: this.props.video_component_margin_vertical,
                }}

                onPress={this._onPressImage}
                disabled={should_render_youtube_instance}
            >
                <>
                    {should_render_youtube_instance ?
                        < Youtube
                            style={{
                                flex: 1,
                                height: this.props.youtube_instance_height,
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

                        /* Display the thumbnail for nicely evaluated UI */
                        <View>
                            {this.props.thumbnail.length > 0 && (
                                <Image
                                    source={{ uri: this.props.thumbnail }}
                                    style={{
                                        flex: 1,
                                        height: this.props.youtube_instance_height
                                    }}
                                />
                            )}
                        </View>
                    }

                    <View
                        style={{
                            backgroundColor: "white",
                            paddingHorizontal: 12,
                            height: this.props.video_information_section_height,
                            alignItems: "center",
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View style={style.video_title_container}>
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

const style = StyleSheet.create({
    video_title_container: {
        justifyContent: "center",
        marginRight: 10,
        flex: 1,
    },

    video_title: {
        fontSize: 14,
        lineHeight: 17,
        letterSpacing: -0.02,
        color: colors.primary
    },

    video_watched_text: {
        fontSize: 12,
        lineHeight: 15,
        letterSpacing: -0.02,
        color: colors.subject,
    }
})