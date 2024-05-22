import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  Dimensions, TextInput, Button
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { useBluetooth } from '../../hooks/BluetoothContext';
import { Svg, Rect } from 'react-native-svg';
import { Buffer } from 'buffer'; // Importiere Buffer
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const Temperature = ({ onContinue }) => {
  const [displayData, setDisplayData] = useState([]);
  const [buffer, setBuffer] = useState([]);
  const [tempDataForSave, setTempDataForSave] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [description, setDescription] = useState("");
  const [scans, setScans] = useState([]);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);

  const { connectedPeripheralId, isMeasuring, toggleMeasurement, sendControlCommand, startNotification, stopNotification } = useBluetooth();

  useFocusEffect(
    useCallback(() => {
      const startMeasurement = async () => {
        if (!connectedPeripheralId) {
          alert('No device is connected. Please connect to a device first.');
          return;
        }
        await sendControlCommand('START');
        await startNotification();
      };

      const stopMeasurement = async () => {
        if (isMeasuring) {
          await sendControlCommand('STOP');
          await stopNotification();
        }
      };

      // Start measurement when the screen is focused
      startMeasurement();

      // Stop measurement when the screen is unfocused
      return () => {
        stopMeasurement();
      };
    }, [connectedPeripheralId, isMeasuring])
  );

  useEffect(() => {
    const handleUpdateValueForCharacteristic = (data) => {
      console.log('handleUpdateValueForCharacteristic called');
      const receivedData = Buffer.from(data.value).toString();
      console.log('Received data: ', receivedData);
      if (receivedData === "StartNewPacket") {
        setBuffer([]);
      } else {
        try {
          const tempArray = JSON.parse(receivedData);
          setBuffer(oldBuffer => {
            const updatedBuffer = [...oldBuffer, tempArray];
            if (updatedBuffer.length === 4) {
              setDisplayData(updatedBuffer);
              return [];
            }
            return updatedBuffer;
          });
        } catch (error) {
          console.error('Error parsing temperature data:', error);
        }
      }
    };

    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    const listener = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    return () => {
      listener.remove();
    };
  }, []);

  const getFillColor = (temp) => {
    if (typeof temp !== 'number' || isNaN(temp)) {
      console.error('Invalid temperature value:', temp);
      return 'rgba(255, 255, 255, 1)';
    }
    const red = 255;
    const green = Math.max(0, 255 - Math.round(temp * 8.5));
    const alpha = Math.min(1, Math.max(0, temp / 30));
    return `rgba(${red}, ${green}, 0, ${alpha})`;
  };

  const saveScan = () => {
    console.log('Executing saveScan function');
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount > 1) {
          return prevCount - 1;
        } else {
          clearInterval(interval);
          setTempDataForSave([...displayData]);
          setDescriptionModalVisible(true);
          setCountdown(0);
          return 0;
        }
      });
    }, 1000);
  };

  const saveDescriptionAndData = () => {
    const timestamp = new Date().toISOString();
    const dataToSave = { timestamp, description, data: tempDataForSave };
    const key = `scan-${timestamp}`;
    AsyncStorage.setItem(key, JSON.stringify(dataToSave)).then(() => {
      console.log('Scan and description saved:', dataToSave);
      setScans(prevScans => [...prevScans, { ...dataToSave, key }]);
      setDescription('');
      setDescriptionModalVisible(false);
    }).catch(error => {
      console.error('Failed to save the scan and description:', error);
    });
  };

  const handleContinue = () => {
    sendControlCommand('STOP');
    onContinue(scans);
  };

  return (
    <View style={styles.container}>
      <View style={styles.heatmapContainer}>
        <Svg height={windowHeight - 250} width={windowWidth - 20}>
          {displayData.map((row, rowIndex) =>
            row.map((value, xIndex) => (
              <Rect
                key={`${rowIndex}-${xIndex}`}
                x={rowIndex * ((windowWidth - 20) / 4)}
                y={xIndex * ((windowHeight - 250) / 16)}
                width={(windowWidth - 20) / 4}
                height={(windowHeight - 250) / 16}
                fill={getFillColor(value)}
              />
            ))
          )}
        </Svg>
      </View>
      <View style={styles.buttonContainerBottom}>
        <TouchableOpacity onPress={saveScan} style={styles.savingButtons}>
          <Text style={styles.buttonText}>{"Save Scan"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleContinue} style={styles.savingButtons}>
          <Text style={styles.buttonText}>{"Continue"}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={descriptionModalVisible}
        onRequestClose={() => {
          setDescriptionModalVisible(false);
        }}
      >
        <View style={styles.modalView}>
          <Text>Please enter a description for the scan:</Text>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
            onChangeText={text => setDescription(text)}
            value={description}
            placeholder="Add a description"
          />
          <Button title="Save Description and Data" onPress={saveDescriptionAndData} />
        </View>
      </Modal>
      {countdown > 0 && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  savingButtons: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    width: 150,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heatmapContainer: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  modalView: {
    marginTop: 110,
    marginBottom: 100,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  countdownContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  countdownText: {
    fontSize: 48,
    color: 'white',
  },
});
