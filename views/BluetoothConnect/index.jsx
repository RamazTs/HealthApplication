import React, { useState } from 'react';
import {
  View, Button, Text, FlatList, TouchableOpacity,
  Modal, StyleSheet, Dimensions
} from 'react-native';
import { useBluetooth } from '../../hooks/BluetoothContext';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const BluetoothConnect = () => {
  const { isScanning, devices, connectedPeripheralId, startScan, connectToDevice, disconnectDevice } = useBluetooth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleBluetoothAction = () => {
    if (connectedPeripheralId) {
      disconnectDevice().catch(error => {
        console.error('Disconnect failed', error);
        alert('Failed to disconnect. Please try again.');
      });
    } else {
      setModalVisible(true);
      startScan();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBluetoothAction} style={styles.bluetoothButton}>
        <Text style={styles.buttonText}>
          {connectedPeripheralId ? "Disconnect" : "Bluetooth Scan"}
        </Text>
      </TouchableOpacity>
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
              <TouchableOpacity onPress={() => {
                connectToDevice(item).catch(error => {
                  console.error('Connection failed', error);
                  alert('Failed to connect. Please try again.');
                });
                setModalVisible(false);
              }}>
                <Text style={styles.modalText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bluetoothButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    width: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default BluetoothConnect;
