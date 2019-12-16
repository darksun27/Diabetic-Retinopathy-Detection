import React, { Component } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
export default class Details extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: `${navigation.getParam(
        'name',
        'Diabetic Retinopathy'
      )}'s Report PDF`,
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
              `https://drive.google.com/viewerng/viewer?embedded=true&url=${this.props.navigation.getParam(
                'uri'
              )}` ||
              'https://drive.google.com/viewerng/viewer?embedded=true&url=http://www.africau.edu/images/default/sample.pdf'
          }}
        />
        <WebView
          style={{
            width: 0,
            height: 0,
            flex: 0
          }}
          source={{
            uri:
              this.props.navigation.getParam('uri') ||
              'http://www.africau.edu/images/default/sample.pdf'
          }}
          onLoad={() => {
            alert('Downloading...');
          }}
        />
      </View>
    );
  }
}
