import React, { useEffect } from 'react';
import { Home } from './views/Home';
import { History } from './views/History';
import { RecordView } from './views/RecordView';
import Questionnaire from './views/Questionnaire'; 
import { Header } from './components/Header';
import { Temperature } from './components/Temperature';
import BluetoothConnect from './views/BluetoothConnect';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { BluetoothProvider } from './hooks/BluetoothContext';
import BleManager from 'react-native-ble-manager';

const Stack = createStackNavigator();

function App() {
  useEffect(() => {
    BleManager.start({ showAlert: false }).catch(error => {
      console.error('BleManager start error:', error);
    });
  }, []);

  const NAVIGATOR_OPTIONS = { initialRouteName: 'Home', header: Header };
  const HOME_NAVIGATION_OPTIONS = { headerShown: false };

  return (
    <BluetoothProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={NAVIGATOR_OPTIONS}>
          <Stack.Screen
            name="Home"
            options={HOME_NAVIGATION_OPTIONS}
            component={Home}
          />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="Questionnaire" component={Questionnaire} />
          <Stack.Screen name="RecordView" component={RecordView} />
          <Stack.Screen name="Temperature" component={Temperature} />
          <Stack.Screen name="BluetoothConnect" component={BluetoothConnect} />
        </Stack.Navigator>
      </NavigationContainer>
    </BluetoothProvider>
  );
}

const styles = StyleSheet.create({});

export default App;
