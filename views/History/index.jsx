import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Alert, Platform} from 'react-native';
import {Button, Divider, Text, LinearProgress} from '@rneui/themed';
// import Icon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const History = props => {
  HISTORY_STATE = {
    INIT: 'INIT',
    LOADED: 'LOADED',
    ERROR: 'ERROR',
  };
  const [history, setHistory] = useState([]);
  const [histState, setHistState] = useState(HISTORY_STATE.INIT);
  const [loaderState, setLoaderState] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
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

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedRecords([]); // Clear selections when entering selection mode
    }
  };

  const toggleRecordSelection = (index) => {
    if (selectedRecords.includes(index)) {
      setSelectedRecords(selectedRecords.filter((id) => id !== index));
    } else {
      setSelectedRecords([...selectedRecords, index]);
    }
  };

  const deleteRecords = async () => {
    const newHistory = history.filter((_, index) => !selectedRecords.includes(index));
    await AsyncStorage.setItem('history', JSON.stringify(newHistory));
    setHistory(newHistory);
    setSelectedRecords([]);
    setSelectionMode(false);
  };

  const shareRecords = async () => {
    const selectedRecordsData = history.filter((_, index) => selectedRecords.includes(index));
    const fileName = 'selectedRecords.json';
    const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.writeFile(path, JSON.stringify(selectedRecordsData), 'utf8');

    try {
      await Share.open({
        url: `file://${path}`,
        type: 'application/json',
      });
      setSelectedRecords([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Sharing error:', error);
    }
  };

  const renderRecord = (record, index) => {
    const isSelected = selectedRecords.includes(index);
    return (
      <View key={index} style={[styles.record, isSelected && styles.selectedRecord]}>
        <Text
          onPress={() => selectionMode ? toggleRecordSelection(index) : navigation.navigate('RecordView', { record })}
          style={styles.recordText}>
          Record {index + 1} - {record.externalData.timestampLocale}
        </Text>
        {selectionMode && (
          <Text style={styles.selectionIndicator}>
            {isSelected ? 'Selected' : 'Tap to select'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button title={selectionMode ? "Finish Selection" : "Select Records"} onPress={toggleSelectionMode} />
      {selectionMode && (
        <View style={styles.actionButtons}>
          <Button title="Delete Selected" onPress={deleteRecords} disabled={selectedRecords.length === 0} />
          <Button title="Share Selected" onPress={shareRecords} disabled={selectedRecords.length === 0} />
        </View>
      )}
      {histState === HISTORY_STATE.LOADED && (
        <ScrollView style={styles.recordsContainer}>
          {history.map((record, index) => renderRecord(record, index))}
        </ScrollView>
      )}
      {histState === HISTORY_STATE.INIT && (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
          <LinearProgress color="primary" value={loaderState} />
        </View>
      )}
      {histState === HISTORY_STATE.ERROR && (
        <View style={styles.errorContainer}>
          <Text>Error Loading History</Text>
        </View>
      )}
    </View>
  );
};

//   if (histState === HISTORY_STATE.INIT) {
//     return (
//       <View style={styles.containerLoading}>
//         <Text h3 style={{color: '#4388d6', marginBottom: 12}}>
//           Loading...
//         </Text>
//         <LinearProgress
//           color="primary"
//           animation={{duration: 700}}
//           value={loaderState}
//         />
//       </View>
//     );
//   }

//   if (histState === HISTORY_STATE.LOADED) {
//     return (
//       <View style={styles.containerLoaded}>
//         {history.map((h, i) => {
//           return (
//             <Button
//               key={`${h.externalData.timestampLocale}-${i}`}
//               buttonStyle={{
//                 borderBottomColor: '#4388d6',
//                 borderBottomWidth: 1,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 width: '100%',
//                 height: 50,
//               }}
//               containerStyle={{
//                 width: '95%',
//               }}
//               type="clear"
//               accessibilityLabel={`Record ${i + 1}`}
//               onPress={() => navigation.push('RecordView', {record: h})}>
//               <Text style={{fontSize: 18}}>
//                 {/* <Icon
//                   name="filetext1"
//                   size={24}
//                   accessible={false}
//                   color={'#4388d6'}
//                 /> */}
//                 {'  '}
//                 Record {i + 1} - {h.externalData.timestampLocale}
//               </Text>
//               {/* <Icon
//                 name="right"
//                 size={18}
//                 accessible={false}
//                 color={'#4388d6'}
//               /> */}
//             </Button>
//           );
//         })}
//       </View>
//     );
//   }

//   if (histState === HISTORY_STATE.ERROR) {
//   }

//   return undefined;
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordsContainer: {
    marginTop: 10,
  },
  record: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedRecord: {
    backgroundColor: '#e2e2e2',
  },
  recordText: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  selectionIndicator: {
    fontSize: 12,
    color: 'grey',
  },
});
// const styles = StyleSheet.create({
//   containerLoading: {
//     marginVertical: 30,
//     marginHorizontal: 15,
//   },
//   containerLoaded: {
//     display: 'flex',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '100%',
//     height: '100%',
//     padding: 5,
//   },
// });
