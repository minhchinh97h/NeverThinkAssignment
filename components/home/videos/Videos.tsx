import React from "react"
import { View, FlatList, Text, Dimensions, Image, TouchableOpacity } from "react-native"
import { GOOGLE_API_KEY_YOUTUBE } from "../../../config/index"
import { ChannelInterface } from "interfaces"
import style from "./style"
import Youtube from "react-native-youtube"
import axios from "axios"

const window_width = Dimensions.get("window").width

export default class Videos extends React.PureComponent<any, any> {

    state = {
        video_array: null
    }

    _keyExtractor = (item: string, index: number) => `videos-section-playlist-videoid-${item}-index-${index}`

    _renderItem: any = ({ item, index }: { item: string, index: number }) => (
        <Video
            videoId={item}
            index={index}
        />
    )

    _renderVideosBasedOnCurrentChannel = (playlist: Array<string>) => {
        let video_array: any = []
        playlist.forEach((videoId: string, index: number) => {
            video_array.push(
                <Video videoId={videoId} index={index} key={`videos-section-playlist-videoid-${videoId}-index-${index}`} />
            )
        })

        this.setState({
            video_array
        })
    }

    componentDidMount() {
        this._renderVideosBasedOnCurrentChannel(this.props.channels[this.props.current_channel].playlist)
    }

    render() {
        return (
            <View
                style={style.container}
            >
                <FlatList
                    data={this.props.channels[this.props.current_channel].playlist}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                />

                {/* {this.state.video_array} */}
            </View>
        )
    }
}

interface VideoProps {
    videoId: string,
    index: number
}

interface VideoState {
    status: boolean,
    thumbnail: string,
    video_snippet: any
}

class Video extends React.PureComponent<VideoProps, VideoState> {

    state: VideoState = {
        status: false,
        thumbnail: "",
        video_snippet: {}
    }

    _onChangeState = (e: any) => {

    }

    _getVideoThumbnail = (videoId: string) => {
        this.setState({
            thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`
        })
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
                let snippet = { ...res.data.items[0].snippet }

                let thumbnail_uri: string = this._returnHighestThumbnailRes(snippet.thumbnails)

                this.setState({
                    thumbnail: thumbnail_uri,
                    video_snippet: snippet
                })
            })
            .catch(err => {
            })
    }

    componentDidMount() {
        this._getVideoInfo(this.props.videoId)
    }

    render() {
        return (
            <View style={{
                marginVertical: 20,
                marginHorizontal: 22,
            }}>
                {/* <Youtube
                    apiKey={GOOGLE_API_KEY_YOUTUBE}
                    style={{
                        width: window_width - 22 * 2,
                        height: 300
                    }}
                    videoId={this.props.videoId}
                /> */}

                <TouchableOpacity>

                    {this.state.thumbnail.length > 0 &&
                        (
                            <Image
                                source={{ uri: this.state.thumbnail }}
                                style={{
                                    flex: 1,
                                    height: 300
                                }}
                            />
                        )
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