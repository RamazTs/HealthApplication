import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
// import AntIcon from 'react-native-vector-icons/AntDesign';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export const Home = props => {
  const {navigation} = props;
  const navigate = location => {
    navigation.push(location);
  };

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
