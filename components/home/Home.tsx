import React from "react";
import { SafeAreaView, View, Text, FlatList } from "react-native";
import Channels from "./channels/Channels.Container";
import Videos from "./videos/Videos.Container"

interface DataItem {
    id: string
}

export default class Home extends React.PureComponent {
    static navigationOptions = () => ({

    })

    state = {
        data: [
            {
                id: "channels"
            },
            {
                id: "videos"
            }
        ]
    }

    _keyExtractor = (item: DataItem, index: number) => `home-page-section-${item.id}-${index}`

    _renderItem: any = ({ item }: { item: DataItem }) => {
        if (item.id === "channels") {
            return (
                <Channels />
            )
        } else if (item.id === "videos") {
            return (
                <Videos />
            )
        }
    }

    componentDidMount() {

    }

    render() {
        return (
            <View
                style={{
                    flex: 1,
                }}
            >
                <FlatList
                    data={this.state.data}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                />
            </View>
        )
    }
}