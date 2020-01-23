import React from "react"
import { View, FlatList, Text, Dimensions, Image, TouchableOpacity } from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../config/index"
import { ChannelInterface } from "interfaces"
import style from "./style"
import Youtube from "react-native-youtube"
import axios from "axios"

const window_width = Dimensions.get("window").width

interface VideosState {
    should_flatlist_update: number
}

export default class Videos extends React.PureComponent<any, VideosState> {

    state: VideosState = {
        should_flatlist_update: 0
    }

    _keyExtractor = (item: string, index: number) => `videos-section-playlist-videoid-${item}-index-${index}`

    _renderItem: any = ({ item, index }: { item: string, index: number }) => (
        <Video
            videoId={item}
            index={index}

            video_data={this.props.video_data}
            current_video_id={this.props.current_video_id}
            updateCurrentVideoId={this.props.updateCurrentVideoId}
        />
    )

    componentDidMount() {
    }

    componentDidUpdate(prevProps: any, prevState: VideosState) {
        if (this.props.current_video_id !== prevProps.current_video_id) {
            this.setState(prevState => ({
                should_flatlist_update: prevState.should_flatlist_update + 1
            }))
        }
    }

    render() {
        return (
            <View
                style={style.container}
            >
                <FlatList
                    data={this.props.channels[this.props.current_channel].playlist}
                    extraData={this.state.should_flatlist_update}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    windowSize={3}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                />
            </View>
        )
    }
}

interface VideoProps {
    videoId: string,
    index: number,
    video_data: any,
    current_video_id: string,
    updateCurrentVideoId: (s: string) => any
}

interface VideoState {
    status: string,
    thumbnail: string,
    video_snippet: any
}

class Video extends React.PureComponent<VideoProps, VideoState> {

    youtube_ref: any = React.createRef()
    mounted = false

    state: VideoState = {
        status: "stopped",
        thumbnail: "",
        video_snippet: {}
    }
    _onChangeState = (e: any, t: any) => {
        this.setState({
            status: e.status
        })
    }

    _returnCurrentTimeOfPlayedVideo = () => {
        return this.youtube_ref.current.getCurrentTime()
    }

    _checkIfThumbNailUriValid = (uri: string) => {
        if (uri.length > 0) {
            return true
        }

        return false
    }

    _returnHighestThumbnailRes = (thumbnails: any) => {
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

    _getVideoInfo = (videoId: string) => {
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
                if (this.mounted) {
                    let snippet = { ...res.data.items[0].snippet }

                    let thumbnail_uri: string = this._returnHighestThumbnailRes(snippet.thumbnails)


                    this.setState({
                        thumbnail: thumbnail_uri,
                        video_snippet: snippet
                    })
                }
            })
            .catch(err => {
            })
    }

    _onPressImage = () => {
        this.props.updateCurrentVideoId(this.props.videoId)
    }

    componentDidMount() {
        this.mounted = true
        this._getVideoInfo(this.props.videoId)
    }

    componentWillUnmount() {
        this.mounted = false
    }

    render() {
        return (
            <View style={{
                marginVertical: 20,
                marginHorizontal: 22,
            }}>
                <TouchableOpacity
                    style={{
                        position: "relative"
                    }}

                    onPress={this._onPressImage}
                >
                    {this.props.videoId === this.props.current_video_id ?
                        <Youtube
                            style={{
                                flex: 1,
                                height: 300,
                            }}
                            apiKey={GOOGLE_API_KEY_YOUTUBE}
                            videoId={this.props.videoId}
                            onChangeState={this._onChangeState}
                            ref={this.youtube_ref}
                        />

                        :

                        <>
                            {this.state.thumbnail.length > 0 && (
                                <Image
                                    source={{ uri: this.state.thumbnail }}
                                    style={{
                                        flex: 1,
                                        height: 300
                                    }}
                                />
                            )}
                        </>
                    }
                </TouchableOpacity>

                <View
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
                </View>
            </View>
        )
    }
}