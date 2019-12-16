import React, { Component } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
export default class MinorReport extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `Minor Report`,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    };
  };
  render() {
    return (
      <View
        style={{
          flex: 1,
          position: 'absolute'
        }}
      >
        <WebView
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            flex: 1
          }}
          source={{
            uri:
              'https://docs.google.com/document/d/1rxhuYjvv9RFI4OfM5f-UNWOJdY3xGWRhhN_29G-lglg/edit?usp=sharing'
          }}
        />
      </View>
    );
  }
}
