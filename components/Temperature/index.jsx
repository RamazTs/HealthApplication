import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { useBluetooth } from '../../hooks/BluetoothContext';
import { Svg, Rect } from 'react-native-svg';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import TTS from 'react-native-tts';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export const Temperature = ({ onContinue }) => {
  const [displayData, setDisplayData] = useState([]);
  const [buffer, setBuffer] = useState([]);
  const [countdown, setCountdown] = useState(0);
  const [description, setDescription] = useState("Default Description");
  const [scans, setScans] = useState([]);
  const [shouldSave, setShouldSave] = useState(false);

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
        startVoiceInstructions();
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
        cleanupVoice();
      };
    }, [connectedPeripheralId, isMeasuring])
  );

  useEffect(() => {
    const handleUpdateValueForCharacteristic = (data) => {
      const receivedData = Buffer.from(data.value).toString();
      if (receivedData === "StartNewPacket") {
        setBuffer([]);
      } else {
        try {
          const tempArray = JSON.parse(receivedData);
          setBuffer(oldBuffer => {
            const updatedBuffer = [...oldBuffer, tempArray];
            if (updatedBuffer.length === 4) {
              setDisplayData(updatedBuffer);
              if (shouldSave) {
                saveScan(updatedBuffer);  // Save the latest data if shouldSave is true
                setShouldSave(false);
              }
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
  }, [shouldSave]);

  const startVoiceInstructions = () => {
    TTS.speak("Say Save or press the save scan button to save the scan", {
      onDone: startVoiceRecognition
    });
  };

  const startVoiceRecognition = () => {
    Voice.start('en-US');
    setTimeout(() => {
      Voice.stop();
    }, 5000); // Stop the recording after 5 seconds
  };

  function onSpeechPartialResults (event) {
    const recognizedText = event.value[0].toLowerCase();
    console.log('Recognized text:', recognizedText); // Log the recognized text
    if (recognizedText.includes('save')) {
      console.log('Recognized command to save'); // Log the command recognition
      startCountdown();
    } else if (recognizedText.includes('safe')){
      console.log('Recognized command to save'); // Log the command recognition
      startCountdown();
    } else {
      console.log('Unrecognized command'); // Log if the command is not recognized
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android')
      Voice.onSpeechResults = onSpeechPartialResults;
    else Voice.onSpeechPartialResults = onSpeechPartialResults;
    return () => {
      cleanupVoice();
    };
  }, []);

  const cleanupVoice = () => {
    Voice.destroy().catch(error => console.error('Failed to destroy voice:', error));
    TTS.stop().catch(error => console.error('Failed to stop TTS:', error));
  };

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

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prevCount => {
        if (prevCount > 1) {
          return prevCount - 1;
        } else {
          clearInterval(interval);
          setShouldSave(true); // Set the flag to save the scan
          setCountdown(0);
          return 0;
        }
      });
    }, 1000);
  };

  const saveScan = (dataToSave) => {
    console.log('Executing saveScan function');
    // console.log('Current displayData:', dataToSave); // Log current displayData
    if (dataToSave.length === 0) {
      console.warn('No data to save');
      return;
    }

    const timestamp = new Date().toISOString();
    const data = { timestamp, description, data: dataToSave };
    const key = `scan-${timestamp}`;
    AsyncStorage.setItem(key, JSON.stringify(data)).then(() => {
      console.log('Scan and description saved:', data);
      const updatedScans = [...scans, { ...data, key }];
      setScans(updatedScans);
      setDescription('Default Description');
      handleContinue(updatedScans); // Pass updated scans to handleContinue
    }).catch(error => {
      console.error('Failed to save the scan and description:', error);
    });
  };

  const handleContinue = (savedScans) => {
    sendControlCommand('STOP');
    onContinue(savedScans);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>Say save or press the button to save the scan</Text>
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
        <TouchableOpacity onPress={startCountdown} style={styles.savingButtons}>
          <Text style={styles.buttonText}>{"Save Scan"}</Text>
        </TouchableOpacity>
      </View>
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
  instructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
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
