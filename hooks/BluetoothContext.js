import React, { createContext, useState, useContext, useEffect } from 'react';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer'; // Importiere Buffer

const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
  const [connectedPeripheralId, setConnectedPeripheralId] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  useEffect(() => {
    console.log('Initializing BleManager');
    BleManager.start({ showAlert: false }).catch(error => {
      console.error('BleManager start error:', error);
    });

    const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    const tryReconnect = async () => {
      try {
        const storedPeripheralId = await AsyncStorage.getItem('connectedPeripheralId');
        if (storedPeripheralId) {
          console.log('Trying to reconnect to ' + storedPeripheralId);
          setConnectedPeripheralId(storedPeripheralId);
          await reconnectDeviceWithRetry(storedPeripheralId, 3000);
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

  const handleDiscoverPeripheral = (peripheral) => {
    // Handle discovered peripheral
  };

  const handleDisconnectedPeripheral = (data) => {
    console.log('Disconnected from ' + data.peripheral);
    if (data.peripheral === connectedPeripheralId) {
      console.log('Attempting to reconnect...');
      reconnectDeviceWithRetry(data.peripheral, 3000);
    }
  };

  const handleUpdateValueForCharacteristic = (data) => {
    console.log('handleUpdateValueForCharacteristic called');
    if (Buffer === undefined) {
      console.error('Buffer is undefined');
    }
    const receivedData = Buffer.from(data.value).toString();
    console.log('Received data: ', receivedData);
    // Handle received data
  };

  const reconnectDeviceWithRetry = async (peripheralId, timeout) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      try {
        await BleManager.connect(peripheralId);
        console.log('Connected to ' + peripheralId);
        setConnectedPeripheralId(peripheralId);
        await AsyncStorage.setItem('connectedPeripheralId', peripheralId);
        await retrieveServices(peripheralId);
        return;
      } catch (error) {
        // console.error('Connection attempt failed, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    console.error('Failed to reconnect within timeout period.');
    alert('Failed to reconnect. Please check the device and try again.');
  };

  const retrieveServices = async (peripheralId) => {
    try {
      const peripheralInfo = await BleManager.retrieveServices(peripheralId);
      console.log('Retrieved services and characteristics', peripheralInfo);
      // Do not start notifications here
    } catch (error) {
      console.error('Failed to retrieve services:', error);
      alert('Failed to retrieve services. Please try again.');
    }
  };

  const startNotification = async () => {
    if (connectedPeripheralId) {
      const serviceUUID = '12345678-1234-1234-1234-123456789012'.toLowerCase();
      const characteristicUUID = 'abcd1234-1234-1234-1234-123456789012'.toLowerCase();
      try {
        await BleManager.startNotification(connectedPeripheralId, serviceUUID, characteristicUUID);
        console.log('Started notification for temperature');
      } catch (error) {
        console.error('Failed to start notification:', error);
        alert('Failed to start notification. Please try again.');
      }
    }
  };

  const stopNotification = async () => {
    if (connectedPeripheralId) {
      const serviceUUID = '12345678-1234-1234-1234-123456789012'.toLowerCase();
      const characteristicUUID = 'abcd1234-1234-1234-1234-123456789012'.toLowerCase();
      try {
        await BleManager.stopNotification(connectedPeripheralId, serviceUUID, characteristicUUID);
        console.log('Stopped notification for temperature');
      } catch (error) {
        console.error('Failed to stop notification:', error);
        alert('Failed to stop notification. Please try again.');
      }
    }
  };

  const sendControlCommand = async (command) => {
    if (!connectedPeripheralId) {
      console.error('No device is connected');
      alert('No device is connected. Please connect to a device first.');
      return;
    }
    const serviceUUID = '12345678-1234-1234-1234-123456789012'.toLowerCase();
    const controlCharacteristicUUID = 'abcd4321-1234-1234-1234-123456789012'.toLowerCase();
    try {
      await BleManager.write(connectedPeripheralId, serviceUUID, controlCharacteristicUUID, Buffer.from(command).toJSON().data);
      console.log(`Sent command: ${command}`);
    } catch (error) {
      console.error('Failed to send command:', error);
      alert('Failed to send command. Please try again.');
    }
  };

  const toggleMeasurement = () => {
    if (!isMeasuring) {
      console.log('Starting measurement...');
      sendControlCommand('START');
      setIsMeasuring(true);
    } else {
      console.log('Stopping measurement...');
      sendControlCommand('STOP');
      setIsMeasuring(false);
    }
  };

  return (
    <BluetoothContext.Provider value={{
      connectedPeripheralId,
      isMeasuring,
      toggleMeasurement,
      sendControlCommand,
      startNotification,
      stopNotification,
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
