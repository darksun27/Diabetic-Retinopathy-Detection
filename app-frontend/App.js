import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  StatusBar,
  Dimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Image
} from 'react-native';
import { AppLoading } from 'expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import Encrypter from './Components/Main';
import Details from './Components/Details';
import MinorReport from './Components/MinorReport';
import { Subtitle, Header, Body, Title, Toast, Left } from 'native-base';
import * as Font from 'expo-font';
import jiitLogo from './assets/jiit.png';
import cancer from './assets/cancer.jpg';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

const StatusBarHeight = Platform.select({
  ios: 0,
  android: StatusBar.currentHeight,
  default: 0
});

class App extends React.Component {
  static navigationOptions = {
    title: 'Diabetic Retinopathy',

    headerTitleStyle: {
      fontWeight: 'bold'
    },
    headerRight: () => (
      <Image
        source={cancer}
        style={{
          width: 40,
          height: 40,
          resizeMode: 'contain',
          borderRadius: 20
        }}
      />
    ),
    headerLeft: () => (
      <Image
        source={jiitLogo}
        style={{
          width: 40,
          height: 40,
          resizeMode: 'contain',
          borderRadius: 20
        }}
      />
    )
  };
  state = {
    isReady: false
  };

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font
    });
    this._loadAssetsAsync();
    this.setState({ isReady: true });
  }
  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      require('./assets/preview.png'),
      require('./assets/jiit.png'),
      require('./assets/cancer.jpg'),
      require('./assets/wait.gif')
    ]);

    await Promise.all([...imageAssets]);
  }
  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <StatusBar barStyle='dark-content' />
        <View style={styles.container}>
          <Encrypter {...this.props} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: StatusBarHeight
  }
});

const AppNavigator = createStackNavigator(
  { Home: App, Details: Details, MinorReport: MinorReport },
  {
    headerLayoutPreset: 'center',
    initialRouteName: 'Home'
  }
);

export default createAppContainer(AppNavigator);
