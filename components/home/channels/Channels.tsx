import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity } from "react-native";
import style from "./style";
import { ChannelInterface } from "../../../interfaces"

interface ChannelsState {
    current_index: number,
    last_index: number
}

export default class Channels extends React.PureComponent<any, ChannelsState> {

    state: ChannelsState = {
        current_index: 0,
        last_index: -1,
    }

    _keyExtractor = (item: ChannelInterface, index: number) => `channel-id-${item.id}-index-${index}`

    _renderItem: any = ({ item, index }: { item: ChannelInterface, index: number }) => (
        <Channel
            index={index}
            data={item}
            updateCurrentChannel={this.props.updateCurrentChannel}
        />
    )

    render() {
        return (
            <View
                style={style.channels_container}
            >
                <View style={style.channels_flatlist_container}>
                    <FlatList
                        data={this.props.channels}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                <TouchableOpacity
                    style={style.channels_show_all_container}
                    onPress={() => { }}
                >
                    <Text style={style.channels_show_all_text}>
                        ALL
                    </Text>

                    <Text style={style.channels_show_all_text}>
                        CHANNELS
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}

interface ChannelProps {
    index: number,
    data: ChannelInterface,
    updateCurrentChannel: (n: number) => any
}

interface ChannelState {

}

class Channel extends React.PureComponent<ChannelProps, ChannelState> {

    state: ChannelState = {

    }

    _onPress = () => {
        this.props.updateCurrentChannel(this.props.index)
    }

    componentDidMount() {
        Image.prefetch(this.props.data.icon)
    }

    render() {
        return (
            <TouchableOpacity
                style={style.channel_container}
                onPress={this._onPress}
            >
                <>
                    <Image
                        source={{ uri: this.props.data.icon }}
                        style={{
                            width: 50,
                            height: 50,
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
                </>
            </TouchableOpacity>
        )
    }
}