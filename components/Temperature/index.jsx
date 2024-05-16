import React, { useState, useEffect } from 'react';
import {
  View, Button, Text, FlatList, TouchableOpacity,
  Modal, StyleSheet, Dimensions, TextInput, Alert
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Svg, Rect } from 'react-native-svg';
import Voice from '@react-native-voice/voice';
import TTS from 'react-native-tts';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const Temperature = ({ onContinue }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [displayData, setDisplayData] = useState([]);
  const [tempDataForSave, setTempDataForSave] = useState([]);
  const [buffer, setBuffer] = useState([]);
  const [connectedPeripheralId, setConnectedPeripheralId] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [description, setDescription] = useState("");
  const [scans, setScans] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    console.log('Initializing BleManager');
    BleManager.start({ showAlert: false }).catch(error => {
      console.error('BleManager start error:', error);
    });

    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);

    const tryReconnect = async () => {
      try {
        const storedPeripheralId = await AsyncStorage.getItem('connectedPeripheralId');
        if (storedPeripheralId) {
          console.log('Trying to reconnect to ' + storedPeripheralId);
          BleManager.isPeripheralConnected(storedPeripheralId, []).then((isConnected) => {
            if (isConnected) {
              console.log('Device is already connected.');
              setConnectedPeripheralId(storedPeripheralId);
            } else {
              console.log('Stored device not connected, attempting to reconnect');
              connectToDevice({ id: storedPeripheralId });
            }
          });
        } else {
          console.log('No stored device ID found');
        }
      } catch (error) {
        console.error('Error in tryReconnect:', error);
      }
    };

    tryReconnect();

    return () => {
      console.log('Removing BleManager listeners');
      bleManagerEmitter.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (historyModalVisible) {
      loadScans();
    }
  }, [historyModalVisible]);

  const startScan = () => {
    setIsScanning(true);
    setModalVisible(true);
    BleManager.scan([], 5, true).then(() => {
      console.log('Scanning...');
      setIsScanning(false);
    }).catch(error => {
      console.error('Error during scan:', error);
      setIsScanning(false);
    });
  };

  useEffect(() => {
    const onSpeechResults = (e) => {
      const speechText = e.value[0].toLowerCase();
      console.log('Recognized:', speechText);
      if (speechText.includes("save scan")) {
        setDescriptionModalVisible(true);
        setIsListening(false); // Stop listening when command is recognized
      }
    };

    const onSpeechError = (e) => {
      console.error('onSpeechError: ', e.error);
    };

    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    // Start listening when component mounts
    startListening();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    if (!isListening) {
      setIsListening(true);
      await Voice.start('en-US');
    }
  };

  const stopListening = async () => {
    if (isListening) {
      await Voice.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleDiscoverPeripheral = (peripheral) => {
    if (peripheral.name) {
      setDevices(currentDevices => {
        if (currentDevices.some(device => device.id === peripheral.id)) {
          return currentDevices;
        } else {
          return [...currentDevices, peripheral];
        }
      });
    }
  };

  const connectToDevice = (peripheral) => {
    console.log('Checking connection status for:', peripheral.id);

    BleManager.isPeripheralConnected(peripheral.id, [])
      .then((isConnected) => {
        if (isConnected) {
          console.log('Device already connected:', peripheral.id);
          setConnectedPeripheralId(peripheral.id); // Always update the state to reflect the connected device
          setModalVisible(false);
        } else {
          proceedWithConnection(peripheral);
        }
      })
      .catch((error) => {
        console.error('Error checking connection status:', error);
        alert('Error checking connection status. Please try again.');
      });
  };

  const proceedWithConnection = (peripheral) => {
    BleManager.connect(peripheral.id)
      .then(() => {
        console.log('Connected to ' + peripheral.id);
        setConnectedPeripheralId(peripheral.id); // Update state here after a successful connection
        AsyncStorage.setItem('connectedPeripheralId', peripheral.id); // Speichere die Geräte-ID
        setModalVisible(false);
        return BleManager.retrieveServices(peripheral.id);
      })
      .then((peripheralInfo) => {
        console.log('Retrieved services and characteristics', peripheralInfo);
        const serviceUUID = '12345678-1234-1234-1234-123456789012'.toLowerCase();
        const characteristicUUID = 'abcd1234-1234-1234-1234-123456789012'.toLowerCase();
        return BleManager.startNotification(peripheral.id, serviceUUID, characteristicUUID);
      })
      .then(() => {
        console.log('Started notification for temperature');
      })
      .catch((error) => {
        console.error('Connection error', error);
        alert('Failed to connect. Please check the device and try again.');
      });
  };

  const handleUpdateValueForCharacteristic = (data) => {
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

  const handleDisconnectedPeripheral = (data) => {
    console.log('Disconnected from ' + data.peripheral);
    if (data.peripheral === connectedPeripheralId) {
      console.log('Attempting to reconnect...');
      connectToDevice({ id: data.peripheral });
    }
  };

  const toggleMeasurement = () => {
    if (isMeasuring) {
      sendControlCommand('STOP');
      setIsMeasuring(false);
    } else {
      sendControlCommand('START');
      setIsMeasuring(true);
    }
  };

  const sendControlCommand = (command) => {
    if (!connectedPeripheralId) {
      console.error('No device is connected');
      alert('No device is connected. Please connect to a device first.');
      return;
    }
    const serviceUUID = '12345678-1234-1234-1234-123456789012'.toLowerCase();
    const controlCharacteristicUUID = 'abcd4321-1234-1234-1234-123456789012'.toLowerCase();
    BleManager.write(connectedPeripheralId, serviceUUID, controlCharacteristicUUID, Buffer.from(command).toJSON().data)
      .then(() => {
        console.log(`Sent command: ${command}`);
      })
      .catch((error) => {
        console.error('Failed to send command:', error);
        alert('Failed to send command. Please try again.');
      });
  };

  const getFillColor = (temp) => {
    if (typeof temp !== 'number' || isNaN(temp)) {
      console.error('Invalid temperature value:', temp);
      return 'rgba(255, 255, 255, 1)';  // Weiß als Fallback-Farbe
    }
    const red = 255;
    const green = Math.max(0, 255 - Math.round(temp * 8.5));
    const alpha = Math.min(1, Math.max(0, temp / 30));
    return `rgba(${red}, ${green}, 0, ${alpha})`;
  };

  const handleBluetoothAction = () => {
    if (connectedPeripheralId) {
      // Wenn bereits verbunden, trenne die Verbindung
      disconnectDevice();
    } else {
      // Wenn nicht verbunden, starte den Scan
      startScan();
    }
  };

  const disconnectDevice = () => {
    if (connectedPeripheralId) {
      BleManager.disconnect(connectedPeripheralId)
        .then(() => {
          console.log('Disconnected from ' + connectedPeripheralId);
          AsyncStorage.removeItem('connectedPeripheralId') // Lösche die gespeicherte ID
            .then(() => {
              console.log('Removed connected device ID from storage');
              setConnectedPeripheralId(null); // Setze die verbundene Geräte-ID zurück
              alert('Disconnected successfully.');
            })
            .catch(error => {
              console.error('Failed to remove device ID from storage', error);
            });
        })
        .catch((error) => {
          console.error('Disconnect failed', error);
          alert('Failed to disconnect. Please try again.');
        });
    }
  };

  const saveScan = () => {
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
      setDescription('');
      setDescriptionModalVisible(false);
    }).catch(error => {
      console.error('Failed to save the scan and description:', error);
    });
  };

  const loadScans = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const scanKeys = keys.filter(key => key.startsWith('scan-'));
      const result = await AsyncStorage.multiGet(scanKeys);
      let loadedScans = result.map(item => ({ key: item[0], ...JSON.parse(item[1]) }));
      loadedScans.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setScans(loadedScans);
    } catch (error) {
      console.error('Fehler beim Laden der Scans:', error);
      setScans([]);
    }
  };

  const navigateToHistory = () => {
    setHistoryModalVisible(true);
  };

  const handlePress = (item) => {
    const options = ['Daten anzeigen', 'Scan löschen', 'Abbrechen'];
    Alert.alert(
      'Wähle eine Aktion',
      'Was möchtest du mit diesem Scan tun?',
      options.map((option, index) => ({
        text: option,
        onPress: () => {
          if (option === 'Daten anzeigen') {
            showData(item);
          } else if (option === 'Scan löschen') {
            deleteScan(item.key);
          }
        },
        style: option === 'Abbrechen' ? 'cancel' : 'default',
      })),
    );
  };

  const showData = (item) => {
    console.log("Anzeigen der Daten für: ", item);
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const deleteScan = async (key) => {
    await AsyncStorage.removeItem(key);
    setScans(scans.filter(scan => scan.key !== key));
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainerTop}>
        <TouchableOpacity onPress={handleBluetoothAction} style={styles.bluetoothButton}>
          <Text style={styles.buttonText}>
            {connectedPeripheralId ? "Disconnect" : "Bluetooth Scan"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleMeasurement} style={styles.bluetoothButton}>
          <Text style={styles.buttonText}>{isMeasuring ? "Stop Scan" : "Start Scan"}</Text>
        </TouchableOpacity>
      </View>
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
        <TouchableOpacity onPress={navigateToHistory} style={styles.savingButtons}>
          <Text style={styles.buttonText}>{"History"}</Text>
        </TouchableOpacity>
        <Button title="Continue" onPress={() => {
          console.log('Continue button pressed');
          onContinue();
        }} />
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <FlatList
            data={devices}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => connectToDevice(item)}>
                <Text style={styles.modalText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={descriptionModalVisible}
        onRequestClose={() => {
          setDescriptionModalVisible(false);
          startListening(); // Restart listening if modal is dismissed
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalView}>
          <FlatList
            data={scans}
            keyExtractor={item => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handlePress(item)}>
                <View style={styles.listItem}>
                  <Text style={styles.dateText}>{new Date(item.timestamp).toLocaleString()}</Text>
                  <Text style={styles.descriptionText}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setHistoryModalVisible(false)} />
        </View>
      </Modal>
      <Modal
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Scan Details:</Text>
          {selectedItem && (
            <Text>{JSON.stringify(selectedItem, null, 2)}</Text>
          )}
          <Button title="Schließen" onPress={() => setDetailModalVisible(false)} />
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
  buttonContainerTop: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingHorizontal: 10,
    //paddingBottom: 15,
  },
  bluetoothButton: {
    padding: 10,
    backgroundColor: '#007AFF',  // iOS blue color
    borderRadius: 5,
    width: 150,
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
    backgroundColor: '#007AFF',  // iOS blue color
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  countdownContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Halbtransparenter Hintergrund
  },
  countdownText: {
    fontSize: 48,
    color: 'white',
  },
  scanItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  scanDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanData: {
    fontSize: 14,
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
});

