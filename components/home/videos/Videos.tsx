import React from "react"
import {
    View,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ActivityIndicator,
    StyleSheet
} from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../config"
import { colors } from "../../../style"
import {
    ChannelInterface,
    VideoHistoryInterface,
    Action_updateCurrentVideoId,
    Action_updateVideoHistory
} from "../../../interfaces"
import axios from "axios"

import Video from "./components/video/Video"

const youtube_instance_height: number = 301             // The height of the Youtube Instance, as well as its alternative thumbnail.
const video_information_section_height: number = 50     // The height of the component below the Youtube Instance that displays its title and "Watched" flag.
const video_component_margin_vertical: number = 20      // The margin of the video component for nicely proportional UI.

/* This variable plays an important role in helping the app avoiding the bad effects of "UNAUTHORIZED_OVERLAY" and "The Youtube Instance has released" since it
makes only 1 video component available in the main view area. it can also be used for scrolling methods, getItemLayout for initial scroll index, etc. */
const video_component_total_height: number = youtube_instance_height + video_component_margin_vertical * 2 + video_information_section_height

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

interface VideoResponseSync {
    thumbnail: string
    video_snippet: any
    videoId: string
}

//  A vertical Flatlist that contains videos in the chosen channel.
export default class Videos extends React.PureComponent<VideosProps, VideosState> {
    // Flatlist' ref for scrolling methods
    flatlist_ref: any = React.createRef()

    /* Used for initialScrollIndex prop of Flatlist to navigate to closet "unseen" videos, or in case there are no
    "unseen" videos, navigate to the first video of the playlist */
    start_index: number = -1

    /* Hold the pressed video's index in the playlist so when the video component is within the main view area (not partly hidden),
    it will have Youtube Instance mounted and play. */
    pressed_video_index: number = -1

    // Used for viewabilityConfig prop of Flatlist to control the main view area's threshold (currently 95% of the Flatlist' height)
    _viewabilityConfig = {
        viewAreaCoveragePercentThreshold: 95
    }

    state: VideosState = {
        should_flatlist_update: 0, // Counting flag to update Flatlist when necessary

        current_video_index: -1, /* When a video component is pressed, this variable will be updated with its index in the playlist data.
        This variable acts as the first condition for Youtube Instance to be mounted (second is whether the video component's video id equals
        to current_video_id reducer). */

        should_display_flatlist: false, /* Boolean to decide whether should we mount a new Flatlist 
        when changing channels (after ending Activity Indicator) */

        flatlist_data: [], // used for data prop of Flatlist. This will be updated with according playlists when changing channels.
        should_load_activity_indicator: true /* Boolean to indicate should show Activity Indicator 
        when changing channels meanwhile the app load async calls */
    }

    // Function to be invoked when changing the channel
    _changeChannelPlaylist = () => {
        this.setState({
            should_load_activity_indicator: true // Display an Activity Indicator while fetching playlist's videos data.
        }, () => {
            this._updateFlatlistData()
        })
    }

    // Draw the pressed video component view to the users
    _scrollToVideo = (index: number) => {
        this.setState(prevState => ({
            current_video_index: index, /* When this function is called, meaning users want to see the video, 
            we make the first condition satisfied. */
            should_flatlist_update: prevState.should_flatlist_update + 1 // Update flatlist
        }), () => {
            this.pressed_video_index = index // Record the pressed video's index to use in onScroll event.

            // Only scroll to the video when Flatlist's ref is available.
            if (this.flatlist_ref.current && this.flatlist_ref.current.scrollToOffset) {
                this.flatlist_ref.current.scrollToOffset({
                    offset: index * video_component_total_height,
                    animated: true
                });
            }
        })
    }

    // For better performance and to be able to use initialScrollIndex prop and scrolling methods
    _getItemLayout = (data: string[] | null, index: number) => ({
        length: video_component_total_height,
        offset: video_component_total_height * index,
        index
    })

    /*
    The function ensures to dismount the Youtube Instance when it is partly hidden (scrolled up or down, hidden by
    top horizon or bottom horizon). This approach minimizes the chances of encountering "UNAUTHORIZED_OVERLAY" error in
    Android, which will make the Youtube Instance malfunction.
    */
    _onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        let flatlist_view_height = e.nativeEvent.layoutMeasurement.height /* The height of main view area provided by Flatlist, 
        which is used to calculate bottom horizon */

        // Check if the current video component is partly hidden by top or bottom horizons.
        let y_top_offset = e.nativeEvent.contentOffset.y // top horizon.
        let y_bottom_offset = y_top_offset + flatlist_view_height // bottom horizon.

        // Youtube Instance's top offset. This is calculated to neglect the video component's top margin.
        let youtube_instance_y_top_offset = this.pressed_video_index * video_component_total_height + video_component_margin_vertical

        /* Youtube Instance's bottom offset. This is calculated to neglect the video component's bottom margin, meaning the youtube instance 
        will be dismounted when intersecting its title's container to the bottom horizon. */
        let youtube_instance_y_bottom_offset = (this.pressed_video_index + 1) * video_component_total_height - video_component_margin_vertical

        /* meaning the Youtube Instance is scrolled up => 
        intersect with top horizon => 
        dismount Youtube Instance by violating the first condition */
        if (y_top_offset > youtube_instance_y_top_offset) {
            this.setState({
                current_video_index: -1
            })
        }

        /* meaning the Youtube Instance is scrolled down => 
        intersect with bottom horizon => 
        dismount Youtube Instance by violating the first condition */
        else if (y_bottom_offset < youtube_instance_y_bottom_offset) {
            this.setState({
                current_video_index: -1
            })
        }

        /* meaning the Youtube Instance is within the main view area => 
        resume mounting the Youtube Instance if the pressed video is in the main view area */
        else {
            this.setState({
                current_video_index: this.pressed_video_index
            })
        }
    }

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
            youtube_instance_height={youtube_instance_height}
            video_information_section_height={video_information_section_height}
            video_component_margin_vertical={video_component_margin_vertical}
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

    // Async GET method to retrieve video's snippet data
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

                let return_obj: VideoResponseSync = {
                    thumbnail: thumbnail_uri,
                    video_snippet: snippet,
                    videoId
                }
                return return_obj
            })
            .catch(err => {
                let return_obj: VideoResponseSync = {
                    thumbnail: "",
                    video_snippet: {},
                    videoId
                }

                return return_obj
            })
    }

    // Execute concurrent promises to minimize the loading time.
    _callPromises = () => {
        let { current_channel_index, channels } = this.props
        let { playlist } = channels[current_channel_index]

        let promise_array = playlist.map((video_id: string) => this._callGetVideoObjectAsync(video_id))

        return Promise.all(promise_array)
    }

    /* When changing channels or the app is firstly mounted, used to update the Flatlist's data and initialScrollIndex props.
    Activity Indicator will be turned off when the process is done and the flag for displaying Flatlist will be activated.
    */
    _updateFlatlistData = async () => {
        // Firstly find the initialScrollIndex
        this._findStartIndex()

        let flatlist_data: Array<any> = []

        // Do async calls with video ids from the new playlist
        try {
            flatlist_data = await this._callPromises()
        }
        catch (err) {
            flatlist_data = []
        }

        this.setState({
            should_display_flatlist: false,
            current_video_index: this.start_index,
            flatlist_data,
            should_load_activity_indicator: false
        }, () => {
            // Only show Flatlist when Activity Indicator is off for smooth transition.
            this.setState({
                should_display_flatlist: true
            })
        })
    }

    /* Find the initialScrollIndex prop of Flatlist. 
    The value can be the nearest "unseen" video, or the first one when all videos are watched in the playlist */
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

        this.pressed_video_index = this.start_index /* Record the starting index 
        since it means the video component with that index is pressed. */
    }

    componentDidMount() {
        // Initially call the function to load the first channel's playlist since current_channel_index is initiallized as 0.
        this._updateFlatlistData()
    }

    componentDidUpdate(prevProps: VideosProps, prevState: VideosState) {
        // Update the Flatlist
        if (this.props.current_video_id !== prevProps.current_video_id
            || this.state.current_video_index !== prevState.current_video_index) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1,
            }))
        }

        // Invoke the function when changing channels
        if (this.props.current_channel_index !== prevProps.current_channel_index) {
            this._changeChannelPlaylist()
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
                                data={this.state.flatlist_data}
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
                                scrollEventThrottle={16} // Higher number means better accuracy but lower performance.
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

const style = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondary,
        overflow: "hidden",
    },
})