import { Permissions } from 'expo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class App extends React.Component {
  state = {
    permissionToRecord: false,
    isLoading: true
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

  render() {
    const { isLoading, permissionToRecord } = this.state;
    
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
            <Text>Start recording!</Text>    
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
