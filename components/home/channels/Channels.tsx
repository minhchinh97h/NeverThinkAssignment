import React from "react";
import { View, FlatList, Text, Image } from "react-native";
import style from "./style";

interface ChannelsState {
    current_index: number,
    last_index: number
}

interface ChannelData {
    id: number,
    name: string,
    icon: string,
    playlist: string[]
}

export default class Channels extends React.PureComponent<any, ChannelsState> {

    state: ChannelsState = {
        current_index: 0,
        last_index: -1,
    }

    _keyExtractor = (item: ChannelData, index: number) => `channel-id-${item.id}-index-${index}`

    _renderItem: any = ({ item, index }: { item: ChannelData, index: number }) => (
        <Channel
            index={index}
            data={item}
        />
    )

    componentDidMount() {

    }

    render() {
        return (
            <View
                style={style.container}
            >
                <FlatList
                    data={this.props.channels}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                    horizontal={true}
                />
            </View>
        )
    }
}

interface ChannelProps {
    index: number,
    data: ChannelData
}

interface ChannelState {

}

class Channel extends React.PureComponent<ChannelProps, ChannelState> {

    state: ChannelState = {

    }

    componentDidMount() {
        Image.prefetch(this.props.data.icon)
    }

    render() {
        return (
            <View
                style={style.channel_container}
            >
                <Image
                    source={{ uri: this.props.data.icon }}
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50,
                    }}
                    resizeMode={"contain"}
                />

                <View
                    style={{
                        marginTop: 10
                    }}
                >
                    <Text style={style.channel_title}>
                        {this.props.data.name}
                    </Text>
                </View>
            </View>
        )
    }
}