import { Audio, FileSystem, Permissions } from 'expo';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

const getAudioConfig = (mode) => {
  return {
    'PLAYBACK': {
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
    },
    'RECORDING': {
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: true
    }
  }[mode];
}

export default class App extends React.Component {
  state = {
    permissionToRecord: false,
    isLoading: true,
    isRecording: false,
    sound: null,
    isPlaying: false
  }

  constructor (props) {
    super(props);

    this.recording = null;
  }
  
  componentDidMount() {
    this.askForPermissionToRecord();
  }

  askForPermissionToRecord = async () => {
    const {status} = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      this.setState({ permissionToRecord: true, isLoading: false });
    } else {
      this.setState({ permissionToRecord: false, isLoading: false });
    }
  }

  startRecording = async () => {
    await Audio.setAudioModeAsync(getAudioConfig('RECORDING'));
    
    this.recording = new Audio.Recording();
    
    try {
      await this.recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await this.recording.startAsync();
    } catch (err) {
      console.error(err);
    }
    
    this.setState({ isRecording: true });
  }

  stopRecording = async () => {
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (err) {
      console.error(err);
    }
    this.setState({ isRecording: false });
    const info = await FileSystem.getInfoAsync(this.recording.getURI());

    await Audio.setAudioModeAsync(getAudioConfig('PLAYBACK'));

    const { sound, status } = await this.recording.createNewLoadedSound({
      isLooping: false,
      isMuted: false,
      volume: 1.0,
      rate: 1.0
    }, (status) => {
      // this is an event listener for the status of the audio file
      if (status.didJustFinish) {
        this.setState({ isPlaying: false });
      }
    });

    this.setState({ sound });
  }

  playPauseSound = () => {
    const { isPlaying, sound } = this.state;
    if (isPlaying) {
      sound.pauseAsync();
      this.setState({ isPlaying: false });
    } else {
      sound.playAsync();
      this.setState({ isPlaying: true });
    }
  }

  render() {
    const { isLoading, permissionToRecord, isRecording, isPlaying, sound } = this.state;
    
    if (isLoading) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {
          permissionToRecord ? (
            <View>
              <Button 
                title={isRecording ? "Stop recording" : "Start recording" }
                onPress={isRecording ? this.stopRecording : this.startRecording}
              />
              {sound && (
                <View>
                  <Button 
                    title={isPlaying ? "Pause": "Play"}
                    onPress={this.playPauseSound}
                  />
                </View>
              )}
            </View>
          ) : (
            <Text>You must enable permission to record in order to use this</Text>
          )
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
