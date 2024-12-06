import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TextInput,
  Button
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export default function App() {
  const qrCodeRef = useRef(null);
  const [bleManager] = useState(new BleManager());
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [displayText, setDisplayText] = useState('Start Scanning');
  const [textToPrint, setTextToPrint] = useState('');

  const requestNearbyDevicePermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        // Check for Android version
        const androidVersion = Platform.Version;
  
        if (androidVersion >= 31) {
          // Request specific permissions for Android 12+
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Location still needed for scanning nearby devices
          ]);
  
          if (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('All permissions granted');
          } else {
            Alert.alert('Permission Denied', 'Some permissions were denied');
          }
        } else {
          // Request location permission for Android versions below 12
          const locationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
  
          if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            Alert.alert('Permission Denied', 'Location permission is required');
          }
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };


  useEffect(() => {
      requestNearbyDevicePermissions();
    return () => {
      // bleManager.destroy();
    };
  }, [bleManager]);

  const startScan = () => {
    if (!connectedDevice) {
      setDevices([]);
      setDisplayText('Scanning...');
      bleManager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            setDisplayText('Scan failed');
            bleManager.stopDeviceScan();
            return;
          }
          if (device.name === 'P58D' || device.localName === 'P58D') {
            setDevices((prevDevices) => {
              if (!prevDevices.find((d) => d.id === device.id)) {
                return [...prevDevices, device];
              }
              return prevDevices;
            });
            bleManager.stopDeviceScan();
            setDisplayText('Device found');
          }
        }
      );
    }
  };

  const handlePrint = async (device) => {
    try {
      const config = []
      const connected = await bleManager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      const services = await bleManager.servicesForDevice(device.id);
      for (const service of services) {
        const characteristics = await bleManager.characteristicsForDevice(
          device.id,
          service.uuid);
        for (const characteristic of characteristics) {
          if (characteristic.isWritableWithoutResponse && characteristic.isNotifiable){
            const config_data = {
              device_id: device.id,
              service_id : service.uuid,
              characteristics_id : characteristic.uuid,
            }
            config.push(config_data);
          }   
        }  
      }
      if (config.length > 0){
        const { device_id, service_id, characteristics_id } = config[0];
        const base64Command = generatePrintData();
        await bleManager.writeCharacteristicWithResponseForDevice(
          device_id,
          service_id,
          characteristics_id,
          base64Command 
        );
      }
      else{
        console.log('no data')
      }
    } catch (error) {
      console.error('Connection error:', error);
      setDisplayText('Connection failed');
    }
  };

  const generatePrintData = () => {
    const qrData = 'https://example.com'; // Replace with your actual QR code data
    const qrDataBuffer = Buffer.from(qrData, 'utf-8');
  
    // QR Code Commands
    const qrCommands = Buffer.concat([
      Buffer.from('\x1B\x61\x01', 'binary'), // Align to the right
      Buffer.from('\x1D\x28\x6B\x04\x00\x31\x41\x32\x00', 'binary'), // Model 2 QR Code
      Buffer.from('\x1D\x28\x6B\x03\x00\x31\x43\x04', 'binary'), // Size 6 QR Code
      Buffer.from('\x1D\x28\x6B\x03\x00\x31\x45\x30', 'binary'), // Error correction
      Buffer.concat([
        Buffer.from('\x1D\x28\x6B', 'binary'),
        Buffer.from([(qrDataBuffer.length + 3) & 0xFF, (qrDataBuffer.length + 3) >> 8]),
        Buffer.from('\x31\x50\x30', 'binary'),
        qrDataBuffer,
      ]),
      Buffer.from('\x1D\x28\x6B\x03\x00\x31\x51\x30', 'binary'), // Print QR code
    ]);
  
    // Text Commands
    const textCommands = Buffer.concat([
      // Buffer.from('\x1B\x61\x00', 'binary'), // Align text to the left
      // Buffer.from('\x1D\x20\x11', 'binary'), // Double width and height for header
      Buffer.from('0407AG044-1 ', 'utf-8'),
      Buffer.from('GP-89555\n', 'utf-8'),
      // Buffer.from('\x1D\x21\x00', 'binary'), // Normal text size
      Buffer.from('23-11-24 11:00 AM\n', 'utf-8'),
    ]);
  
    // Combine Text and QR Code with Spacing
    const combinedCommands = Buffer.concat([
      textCommands, qrCommands, Buffer.from('\n', 'utf-8'),
    ]);
  
    return combinedCommands.toString('base64'); // Use Base64 encoding for BLE or serial printing
  };

 
  return (
    <View style={styles.mainContainer}>
      {devices.length === 0 && !connectedDevice ? (
        <View style={styles.centerContainer}>
          <TouchableOpacity onPress={startScan} style={styles.circleView}>
            <Text style={styles.boldTextStyle}>{displayText}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={styles.deviceItem}>
              <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
              <Text style={styles.deviceId}>ID: {item.id}</Text>
              <TouchableOpacity>
              <Button 
                title= "print"
                color="#841584"
                onPress={() => handlePrint(item)}
              />
              </TouchableOpacity>
            </View>
          )}
        />
      )}   
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleView: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#007BFF',
    marginVertical: 10,
  },
  boldTextStyle: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusText: {
    marginBottom: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '80%',
    marginVertical: 10,
    borderRadius: 8,
  },
  deviceItem: {
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
});
