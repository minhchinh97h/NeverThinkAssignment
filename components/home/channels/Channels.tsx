import React from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../../style"
import { ChannelInterface, Action_updateCurrentChannelIndex } from "../../../interfaces"

interface ChannelsProps {
    channels: Array<ChannelInterface>,
    current_channel_index: number,
    updateCurrentChannelIndex: (n: number) => Action_updateCurrentChannelIndex
}

// A horizontally scrolling top bar for channels
export default class Channels extends React.PureComponent<ChannelsProps> {

    _keyExtractor = (item: ChannelInterface, index: number) => `channel-id-${item.id}-index-${index}`

    _renderItem: any = ({ item, index }: { item: ChannelInterface, index: number }) => (
        <Channel
            index={index}
            data={item}
            updateCurrentChannelIndex={this.props.updateCurrentChannelIndex}
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
            </View>
        )
    }
}

interface ChannelProps {
    index: number,
    data: ChannelInterface,
    updateCurrentChannelIndex: (n: number) => Action_updateCurrentChannelIndex
}

// Channel item rendering each channel's icon and name. 
// Act as buttons to navigate to channel playlists.
class Channel extends React.PureComponent<ChannelProps> {

    _onPress = () => {
        this.props.updateCurrentChannelIndex(this.props.index)
    }

    componentDidMount() {
        // Cache the icon for future loading
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
                            width: 30,
                            height: 30,
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

const style = StyleSheet.create({
    channels_container: {
        borderBottomWidth: 1,
        borderBottomColor: colors.primary,
        flexDirection: 'row',
        backgroundColor: colors.primary,
    },

    channels_flatlist_container: {
        paddingVertical: 11,
        flex: 1,
    },

    channel_container: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
    },

    channel_title: {
        fontSize: 14,
        lineHeight: 17,
        letterSpacing: -0.02,
        color: 'white',
    },
})