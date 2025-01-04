import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import {Button} from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { BleManager } from 'react-native-ble-plx';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, toastConfig } from '../config/config';
import { Buffer } from 'buffer';
import { getFromAPI } from '../../apicall/apicall';
import Dropdown from '../dropdown/Dropdown';
import { generatePrintData } from '../bluetoothPrinter/generatePrintData'; 
import { format } from 'date-fns';

export default function App() {
  const [bleManager] = useState(new BleManager());
  const [devices, setDevices] = useState([]);
  const [displayText, setDisplayText] = useState('Start Scanning');
  const [modalVisible, setModalVisible] = useState(false);
  const [getBlueToothConfig, setBlueToothConfig] = useState(1);
  const [getBlueToothConfigList, setBlueToothConfigList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleShowModal = ()=>{
    setModalVisible(true);
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [response] = await Promise.all([
        getFromAPI('/get_bluetooth_config')
      ]);
      setBlueToothConfigList(response.bluetooth_config)
    } catch (error) {
      Alert.alert('Error', 'Failed to load filter data.');
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchData()
  }, [])

  const handleBluetoothState = async (bleManager) => {
    const currentState = await bleManager.state();
    return currentState;
};

  const handlePrinterTypeChange = async(value)=>{
    setBlueToothConfig(value);
  }

  const handleSubmit = async()=>{
    const bleManager = new BleManager();
    const blueStat = await handleBluetoothState(bleManager);
    if (blueStat == 'PoweredOn'){
      const formattedDate = format(new Date(), 'hh:mma');
      const print_data =  generatePrintData(
        'Test09-B998-1' + ' M-' + String(1000) +  ' ' + 'Single Knotting','GP-688661' + ' B-' + '000000,000000 ' + formattedDate, 'Test', 0)
      const bluetooth_conf = getBlueToothConfigList.find(item => item.value === getBlueToothConfig);
      const isConnected = await bleManager.isDeviceConnected(bluetooth_conf.device_id);
      if (!isConnected){
          const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
          await connected.discoverAllServicesAndCharacteristics();
          await bleManager.writeCharacteristicWithResponseForDevice(
            bluetooth_conf.device_id,
            bluetooth_conf.service_id,
            bluetooth_conf.char_id,
            print_data
              );
          await bleManager.writeCharacteristicWithResponseForDevice(
            bluetooth_conf.device_id,
            bluetooth_conf.service_id,
            bluetooth_conf.char_id,
            print_data
              );   
          bleManager.destroy()
      }
      else {
        const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
          await connected.discoverAllServicesAndCharacteristics();
          await bleManager.writeCharacteristicWithResponseForDevice(
            bluetooth_conf.device_id,
            bluetooth_conf.service_id,
            bluetooth_conf.char_id,
            print_data
              );
          // await bleManager.writeCharacteristicWithResponseForDevice(
          //   bluetooth_conf.device_id,
          //   bluetooth_conf.service_id,
          //   bluetooth_conf.char_id,
          //   print_data
          //     );    
          bleManager.destroy()
      }
    }
    else{
      Toast.show({
            ...toastConfig.error,
            text1: 'Turn ON Bluetooth to Print!',
          });
    }

  }


  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity onPress={() => handleShowModal()}>
        <Icon name="print-outline" size={40} color={colors.header} />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Icon name="close" size={25} color="red"/>
            </TouchableOpacity>
            <View style={{marginBottom:20}}>

            <Dropdown
                data={getBlueToothConfigList}
                setSelectdp={handlePrinterTypeChange}
                label="Printer Type"
                Selectdp={getBlueToothConfig}
              />

            </View>

           <Button
              icon="content-save"
              mode="contained"
              style={{ backgroundColor: colors.button, marginBottom: 20, borderRadius: 10 }}
              disabled={loading}
              onPress={handleSubmit}
            >
              Test Printer
            </Button>
            
            </View>        
       </View>
      </Modal>
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
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
  closeButton: {
    alignSelf: 'flex-end',
  },
});
