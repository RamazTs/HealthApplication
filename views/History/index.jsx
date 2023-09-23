import {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Divider, Text, LinearProgress} from '@rneui/themed';
// import Icon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const History = props => {
  HISTORY_STATE = {
    INIT: 'INIT',
    LOADED: 'LOADED',
    ERROR: 'ERROR',
  };
  const [history, setHistory] = useState([]);
  const [histState, setHistState] = useState(HISTORY_STATE.INIT);
  const [loaderState, setLoaderState] = useState(0);
  const {navigation} = props;

  useEffect(() => {
    AsyncStorage.getItem('history')
      .then(item => {
        setLoaderState(0.5);
        return item ? JSON.parse(item) : [];
      })
      .then(hist => {
        setLoaderState(1);
        setHistState(HISTORY_STATE.LOADED);
        setHistory(hist);
      })
      .catch(error => {
        console.error('ERROR FETCHING HISTORY: ', error);
        setHistState(HISTORY_STATE.ERROR);
      });
  }, []);

  if (histState === HISTORY_STATE.INIT) {
    return (
      <View style={styles.containerLoading}>
        <Text h3 style={{color: '#4388d6', marginBottom: 12}}>
          Loading...
        </Text>
        <LinearProgress
          color="primary"
          animation={{duration: 700}}
          value={loaderState}
        />
      </View>
    );
  }

  if (histState === HISTORY_STATE.LOADED) {
    return (
      <View style={styles.containerLoaded}>
        {history.map((h, i) => {
          return (
            <Button
              key={`${h.externalData.timestampLocale}-${i}`}
              buttonStyle={{
                borderBottomColor: '#4388d6',
                borderBottomWidth: 1,
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                height: 50,
              }}
              containerStyle={{
                width: '95%',
              }}
              type="clear"
              accessibilityLabel={`Record ${i + 1}`}
              onPress={() => navigation.push('RecordView', {record: h})}>
              <Text style={{fontSize: 18}}>
                {/* <Icon
                  name="filetext1"
                  size={24}
                  accessible={false}
                  color={'#4388d6'}
                /> */}
                {'  '}
                Record {i + 1} - {h.externalData.timestampLocale}
              </Text>
              {/* <Icon
                name="right"
                size={18}
                accessible={false}
                color={'#4388d6'}
              /> */}
            </Button>
          );
        })}
      </View>
    );
  }

  if (histState === HISTORY_STATE.ERROR) {
  }

  return undefined;
};

const styles = StyleSheet.create({
  containerLoading: {
    marginVertical: 30,
    marginHorizontal: 15,
  },
  containerLoaded: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 5,
  },
});
