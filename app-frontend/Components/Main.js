import * as React from 'react';
import {
  Button,
  Image,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Clipboard,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { EvilIcons, Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import imagePlaceholder from '../assets/preview.png';
import wait from '../assets/wait.gif';
import { BarCodeScanner } from 'expo-barcode-scanner';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 40;

export default class Encrypter extends React.Component {
  state = {
    text: null,
    data: null,
    type: 'no-data',
    image: false,
    imageSelect: null,
    isUploading: false,
    mainImage: false,
    base64send: null,
    b64: null,
    loading: false,
    hasCameraPermission: null,
    scan: false,
    img: null,
    report: null,
    url: 'http://db6fc4ab.ngrok.io'
  };

  _handlePressButtonAsync = async () => {
    this.props.navigation.navigate('Details', {
      uri: `${this.state.url}/getReport?patient_name=${this.state.text}`,
      name: this.state.text
    });
  };
  minorReport = async () => {
    this.props.navigation.navigate('MinorReport');
  };

  componentDidMount() {
    this.getPermissionAsync();
    this._requestCameraPermission();
  }
  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };

  _handleBarCodeRead = data => {
    Alert.alert('Scan successful!', JSON.stringify(data));
  };

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };
  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1
    });

    if (!result.cancelled) {
      let img = await FileSystem.readAsStringAsync(result.uri, {
        encoding: 'base64'
      });
      img = img.replace('data:image/jpeg;base64,', '');
      img = img.replace('data:image/jpg;base64,', '');
      this.setState({ mainImage: true, image: result.uri, img });
    }
  };

  getReport = async () => {
    console.log('--------Getting Report!--------');
    this.setState({
      loading: true
    });
    // let file = await FileSystem.readAsStringAsync(this.state.mainimage, { encoding: 'base64' });
    // console.log(file.substring(0,50))
    // this.setState({
    //     base64send: file
    // })

    let formData = new FormData();
    formData.append('patient_name', this.state.text);
    formData.append('image_str', this.state.img);

    try {
      let res = await axios.post(`${this.state.url}/detect`, formData);
      let andf = parseFloat(`${res.data.prob}`);
      if (`${res.data.is_cancer}` == 'false') {
        andf = 100 - andf;
      }
      console.log(`${res.data.is_cancer}`, typeof `${res.data.is_cancer}`);
      this.setState({
        data: andf,
        is_cancer: `${res.data.is_cancer}`,
        loading: false
      });

      // REQ Testing

      // setTimeout(() => {
      //   this.setState({
      //     data: `0.8099838393`,
      //     is_cancer: `True`,
      //     loading: false
      //   });
      // }, 4000);
    } catch (err) {
      alert('Decoding Image Failed!');
      this.setState({
        loading: false
      });
      console.log(err);
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold'
            }}
          >
            Please Wait while we are at it!
          </Text>
          <Image
            style={{
              height: HEIGHT / 2,
              width: WIDTH - 100,
              resizeMode: 'contain'
            }}
            source={wait}
          ></Image>
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <SafeAreaView>
          <KeyboardAvoidingView
            behavior='position'
            keyboardVerticalOffset={keyboardVerticalOffset}
          >
            <View
              style={{
                backgroundColor: '#fff',
                height: HEIGHT - 100,
                width: WIDTH - 50,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'space-around',
                position: 'relative'
              }}
            >
              {!this.state.data && (
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 24,
                    textAlign: 'center'
                  }}
                >
                  Upload your Angiography Image
                </Text>
              )}
              {this.state.data && (
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 24,
                    textAlign: 'center'
                  }}
                >
                  Report
                </Text>
              )}

              {!this.state.data && (
                <TextInput
                  placeholder='Enter your Name'
                  style={{
                    height: 50,
                    width: WIDTH - 100,
                    borderWidth: 0,
                    textAlign: 'center',
                    color: 'black',
                    backgroundColor: '#fff',
                    borderBottomColor: '#d9d9d9',
                    borderBottomWidth: 1,
                    shadowColor: 'black',
                    shadowOpacity: 0.26,
                    shadowOffset: { width: 0, height: 4 },
                    shadowRadius: 10,
                    elevation: 3,
                    backgroundColor: '#fff',
                    borderRadius: 5
                  }}
                  onChangeText={text => this.setState({ text: text })}
                />
              )}
              <TouchableOpacity
                style={{
                  width: WIDTH - 100,
                  height: 150,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  opacity: 1,
                  borderRadius: 20,
                  position: 'relative'
                }}
                onPress={() => this._pickImage()}
              >
                {this.state.image && (
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      borderRadius: 20,
                      opacity: 0.5
                    }}
                    source={{ uri: this.state.image }}
                  ></Image>
                )}
                {!this.state.image && (
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      borderRadius: 20,
                      opacity: 0.5
                    }}
                    source={imagePlaceholder}
                  ></Image>
                )}

                {this.state.data && (
                  <Text
                    style={{
                      color: 'black',
                      backgroundColor: '#ffffff99',
                      fontFamily: 'Roboto',
                      textAlign: 'center',
                      width: WIDTH - 100,
                      height: 40,
                      textAlignVertical: 'center',
                      fontWeight: 'bold',
                      opacity: 1
                    }}
                  >
                    Uploaded Image
                  </Text>
                )}
                {!this.state.data && (
                  <Text
                    style={{
                      color: 'black',
                      backgroundColor: '#ffffff99',
                      fontFamily: 'Roboto',
                      textAlign: 'center',
                      width: WIDTH - 100,
                      height: 40,
                      textAlignVertical: 'center',
                      fontWeight: 'bold',
                      opacity: 1
                    }}
                  >
                    {this.state.image
                      ? 'Tap to choose another Image'
                      : 'Tap Pick an Image from Camera Roll'}
                  </Text>
                )}
              </TouchableOpacity>
              {this.state.data && (
                <View>
                  <Text
                    style={{
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                      fontSize: 22,
                      textAlign: 'left',
                      marginBottom: 20,
                      textAlign: 'center',
                      color: '#444'
                    }}
                  >
                    Summary:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18
                    }}
                  >{`Carcinogenic Eye : ${this.state.data.toFixed(2)}%`}</Text>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 18
                    }}
                  >
                    Cancer Predicted :{' '}
                    <Text
                      style={{
                        color: this.state.is_cancer == 'true' ? 'red' : 'green'
                      }}
                    >
                      {this.state.is_cancer == 'true' ? 'Yes' : 'No'}
                    </Text>
                  </Text>
                </View>
              )}
              {!this.state.data && (
                <TouchableOpacity onPress={() => this.getReport()}>
                  <Text
                    style={{
                      alignItems: 'center',
                      textAlign: 'center',
                      width: WIDTH - 100,
                      fontWeight: 'bold',
                      fontSize: 15,
                      height: 50,
                      paddingTop: 15,
                      color: 'white',
                      backgroundColor: '#404040',
                      borderRadius: 10
                    }}
                  >
                    Get Report
                  </Text>
                </TouchableOpacity>
              )}
              {this.state.data && (
                <TouchableOpacity
                  onPress={() => this._handlePressButtonAsync()}
                >
                  <Text
                    style={{
                      alignItems: 'center',
                      textAlign: 'center',
                      width: WIDTH - 100,
                      fontWeight: 'bold',
                      fontSize: 15,
                      height: 50,
                      paddingTop: 15,
                      color: 'white',
                      backgroundColor: '#404040',
                      borderRadius: 10
                    }}
                  >
                    Download & View PDF
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  this.minorReport();
                }}
              >
                <Text
                  style={{
                    color: '#4286f4',
                    fontWeight: 'bold',
                    fontSize: 20
                  }}
                >
                  View Minor Report
                </Text>
              </TouchableOpacity>
              {!this.state.data && (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      scan: true
                    });
                  }}
                >
                  <Text
                    style={{
                      color: 'gray',
                      fontWeight: 'bold'
                    }}
                  >
                    Set Server URL
                  </Text>
                </TouchableOpacity>
              )}
              {this.state.data && (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      text: null,
                      data: null,
                      type: 'no-data',
                      image: false,
                      imageSelect: null,
                      isUploading: false,
                      mainImage: false,
                      base64send: null,
                      b64: null,
                      loading: false,
                      hasCameraPermission: null,
                      scan: false,
                      img: null,
                      report: null
                    });
                  }}
                >
                  <Text>Try Again?</Text>
                </TouchableOpacity>
              )}
              {this.state.scan && (
                <BarCodeScanner
                  onBarCodeScanned={e => this.handleBarCodeScanned(e)}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scan: false, url: data });
  };
}
