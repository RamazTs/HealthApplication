import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { initiateFitbitAuth, getAccessToken } from '../../components/Fitbit/index.js';
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
// import AntIcon from 'react-native-vector-icons/AntDesign';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export const Home = props => {
  const {navigation} = props;
  const navigate = location => {
    navigation.push(location);
  };

  useEffect(() => {
    const handleDeepLink = (event) => {
      let code = /code=([^&]+)/.exec(event.url);
      if (code) {
        code = code[1];
        // Use the updated getAccessToken function here
        getAccessToken(code).then(({ accessToken, refreshToken }) => { 
          console.log("Received Access Token:", accessToken);
          console.log("Received Refresh Token:", refreshToken);
        }).catch(err => {
          console.error("Failed to get access token: ", err);
        });
      }
    };
  
    Linking.addEventListener('url', handleDeepLink);
  
    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  //   useEffect(() => {
  //   const handleDeepLink = (event) => {
  //     let code = /code=([^&]+)/.exec(event.url);
  //     if (code) {
  //       code = code[1];
  //       getAccessToken(code).then(token => {
  //         console.log("Received Token:", token);
  //       }).catch(err => {
  //         console.error("Failed to get access token: ", err);
  //       });
  //     }
  //   };

  //   Linking.addEventListener('url', handleDeepLink);

  //   return () => {
  //     Linking.removeEventListener('url', handleDeepLink);
  //   };
  // }, []);


  return (
    <SafeAreaView>
      <View style={styles.titleContainer}>
        {/* <MaterialIcon name="health-and-safety" size={100} color="#85cffe" /> */}
        <Text style={styles.title}>{'HealthApp'}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          accessible={true}
          accessibilityLabel="Questionnaire"
          accessibilityHint="Navigate To History Page"
          onPress={() => navigate('Questionnaire')}
          style={{
            ...styles.navigationButton,
            ...styles.navigationButtonQuestionnaire,
          }}>
          {/* <AntIcon name="questioncircleo" size={30} color="white"></AntIcon> */}
          <Text accessible={false} style={styles.navigationButtonText}>
            Questionnaire
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessible={true}
          accessibilityLabel="History"
          accessibilityHint="Navigate To History Page"
          onPress={() => navigate('History')}
          style={{
            ...styles.navigationButton,
            ...styles.navigationButtonHistory,
          }}>
          {/* <AntIcon name="filetext1" size={30} color="white"></AntIcon> */}
          <Text accessible={false} style={styles.navigationButtonText}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
      accessible={true}
      accessibilityLabel="Connect to Fitbit"
      accessibilityHint="Initiate Fitbit Authentication"
      onPress={initiateFitbitAuth} 
      style={{
        ...styles.navigationButton,
        ...styles.navigationButtonFitbit,
      }}>
      <Text accessible={false} style={styles.navigationButtonText}>
        Connect to Fitbit
      </Text>
    </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 50,
  },

  title: {
    color: '#85cffe',
    fontSize: 50,
    fontWeight: 'bold',
  },

  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 100,
    marginBottom: 60,
  },

  navigationButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    width: 300,
    height: 100,
    marginVertical: 10,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  navigationButtonHistory: {
    backgroundColor: '#4388d6',
  },
  navigationButtonQuestionnaire: {
    backgroundColor: '#4388d6',
  },
});
