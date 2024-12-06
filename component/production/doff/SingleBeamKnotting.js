import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView  } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput as PaperInput, Button, Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { colors, toastConfig } from '../../config/config';
import Loader from '../../loader/Loader';
import Dropdown from '../../dropdown/Dropdown';
import WrapDetails from './WarpDetails';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFromAPI, postToAPI } from '../../../apicall/apicall';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setWarpDetails } from './warpSlice'; 
import { BleManager } from 'react-native-ble-plx';
import { generatePrintData } from '../../bluetoothPrinter/generatePrintData'; 
import { format } from 'date-fns';


const BeamKnotting = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const warpDetails = useSelector(state => state.warpDetails.warpDetails);
  const { doffinfo = {}} = route.params || {}; 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [docno, setdocno] = useState('AutoNumber');
  const [date, setdate] = useState(new Date().toISOString().split('T')[0]);
  const [getLoomNo, setLoomNo] = useState(doffinfo.loom_detail.value);
  const [getLoomNoDp, setLoomNoDp] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLoomNoDet, setSelectedLoomDet] = useState('');
 const [getChangeTypeDp, setChangeTypeDp] = useState([]);
 const [getChangeType, setChangeType] = useState('');
 const [getShiftDp, setShiftDp] = useState([]);
 const [getShift, setShift] = useState('');
 const [getSortNo, setSortNo] = useState(doffinfo.loom_detail.SortNo);
 const [getWeftDetails, setWeftDetails] = useState([]);
 const [getBeamKnotting, setBeamKnotting] = useState([]);
 const [getBlueToothConfig, setBlueToothConfig] = useState(1);
 const [getBlueToothConfigList, setBlueToothConfigList] = useState([]);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: colors.textLight, fontWeight: 'bold', fontSize: 16 }}>Single Beam Knotting</Text>
      ),
      headerStyle: { backgroundColor: colors.header },
    });
  }, [navigation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = {MachineID: doffinfo.loom_detail.MachineID, WorkOrder_id: doffinfo.loom_detail.WorkOrderID}
      const encodedFilterData = encodeURIComponent(JSON.stringify(data));
      const [response, response1, response2, response3, response4] = await Promise.all([
        getFromAPI('/loom_no_dropdown'),
        getFromAPI('/changeType_dropdown'),
        getFromAPI('/shift_dropdown'), 
        getFromAPI('/get_beam_knotting_details?data=' + encodedFilterData), 
        getFromAPI('/get_bluetooth_config')
      ]);
      setBlueToothConfigList(response4.bluetooth_config)
      setChangeTypeDp(response1.ChangeType);
      setShiftDp(response2.Shift)
      setLoomNoDp(response.document_info); 
      setWeftDetails(response3.beam_knotting[0].Weft)
      dispatch(setWarpDetails(response3.beam_knotting[0].Warp));  
      setBeamKnotting(response3.beam_knotting[0]); 
    } catch (error) {
      Alert.alert('Error', 'Failed to load filter data.');
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);  
    }
  };
  

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setdate(date.toISOString().split('T')[0]); 
      setSelectedDate(date); 
    }
  };

  const handleBluetoothState = async (bleManager) => {
    const currentState = await bleManager.state();
    return currentState;
  };

  const handlePrinterTypeChange = async(value)=>{
    setBlueToothConfig(value);
    setErrors((prevErrors) => ({ ...prevErrors, BlueToothConfig: '' }));
  }

  const handleLoomNoChange = async (selectedLoom) => {
    setLoomNo(selectedLoom);
    const selectedData = getLoomNoDp.find(item => item.value === selectedLoom);
    setSelectedLoomDet(selectedData)
    const data = { UID: selectedData.UID, Description: selectedData.Description }
    // const encodedFilterData = encodeURIComponent(JSON.stringify(data));
    // const response = await getFromAPI('/get_beam_weft_details?data=' + encodedFilterData);
    const sampledata = [
        {YarnMaterial: 'Cotton', Count: '50', End: '120',WarpBeamType: '0', BeamNo: '', EmptyBeamNo: '', SetNo: '', BeamMeter: '', WarpedYarn: '' },
    ]
    if (selectedData) {
        dispatch(setWarpDetails(sampledata));
    } else {
        dispatch(setWarpDetails([]));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getLoomNo) newErrors.loomNo = 'Loom No is required';
    if (!getLoomNo) newErrors.loomNo = 'Loom No is required';
    if (!getChangeType) newErrors.getChangeType = 'Change Type is required';
    if (!getShift) newErrors.getShift = 'Shift is required';
    if (!getBlueToothConfig) newErrors.BlueToothConfig = 'Printer is required';
    setErrors(newErrors);
    const data = {
      beam_knotting: {ChangeType: getChangeType, Shift: getShift, docno, date, 
        SortNo: getSortNo, WarpDetails:warpDetails, WeftDetails:getWeftDetails,
        knotting_info :getBeamKnotting,  },
      doffinfo: doffinfo, page_type:1}
      if (Object.keys(newErrors).length === 0){
        if (warpDetails[0].selectedType){
          setLoading(true);
          const bleManager = new BleManager();
          const blueStat = await handleBluetoothState(bleManager);
          if (blueStat == 'PoweredOn'){
            const response = await postToAPI('/insert_doff_info', data);
          setLoading(false);
          if (response.rval > 0){
            Toast.show({
              ...toastConfig.success,
              text1: response.message,
            });

            const formattedDate = format(new Date(), 'hh:mm a');
            const print_data =  generatePrintData(doffinfo.RollNo + ' M-' + String(doffinfo.DoffMeter) +  ' ' + formattedDate, '  ' + doffinfo.loom_detail.SortNo + ' B-' + doffinfo.loom_detail.BeamNo, doffinfo.RollNo)
              const bluetooth_conf = getBlueToothConfigList.find(item => item.value === getBlueToothConfig);
              const isConnected = await bleManager.isDeviceConnected(bluetooth_conf.device_id);
              if (!isConnected){
                if (response.dataprint.length> 0){
                  for (const item of response.dataprint) {
                    const formattedDate1 = format(new Date(), 'hh:mm a');
                    const print_data1 = generatePrintData(item.RollNo + ' M-' + String(doffinfo.DoffMeter) + ' ' + formattedDate1, ' ' + item.SortNo + ' B-' + doffinfo.loom_detail.BeamNo, item.RollNo);
                    const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
                      await connected.discoverAllServicesAndCharacteristics();
                    // Write the data to the printer for the current item
                    await bleManager.writeCharacteristicWithResponseForDevice(
                      bluetooth_conf.device_id,
                      bluetooth_conf.service_id,
                      bluetooth_conf.char_id,
                      print_data1
                    );
                    
                    // Write the data again (as per your original logic)
                    await bleManager.writeCharacteristicWithResponseForDevice(
                      bluetooth_conf.device_id,
                      bluetooth_conf.service_id,
                      bluetooth_conf.char_id,
                      print_data1
                    );
                  }
                  
                  // After looping through all items, destroy the manager
                  bleManager.destroy(); 
              }
              else{
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
                
            }
            else {
              const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
                await connected.discoverAllServicesAndCharacteristics();
                if (response.dataprint.length> 0){
                  for (const item of response.dataprint) {
                    const formattedDate1 = format(new Date(), 'hh:mm a');
                    const print_data1 = generatePrintData(item.RollNo + ' M-' + String(doffinfo.DoffMeter) + ' ' + formattedDate1, ' ' + item.SortNo + ' B-' + doffinfo.loom_detail.BeamNo, item.RollNo);
                    const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
                    await connected.discoverAllServicesAndCharacteristics();
                    // Write the data to the printer for the current item
                    await bleManager.writeCharacteristicWithResponseForDevice(
                      bluetooth_conf.device_id,
                      bluetooth_conf.service_id,
                      bluetooth_conf.char_id,
                      print_data1
                    );
                    
                    // Write the data again (as per your original logic)
                    await bleManager.writeCharacteristicWithResponseForDevice(
                      bluetooth_conf.device_id,
                      bluetooth_conf.service_id,
                      bluetooth_conf.char_id,
                      print_data1
                    );
                  }
                  
                  // After looping through all items, destroy the manager
                  bleManager.destroy(); 
                }
                else{
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
                
            }
            setTimeout(() => {
              navigation.navigate('Admin');
            }, 1500);
          }
          else{
            Toast.show({
              ...toastConfig.error,
              text1: response.message,
            });
          }
          }
          else{
            Toast.show({
              ...toastConfig.error,
              text1: 'Turn ON Bluetooth to Print!',
            });
          }
          
        }
        else{
          Toast.show({
            ...toastConfig.error,
            text1: 'Please Add BeamNo, SetNo and Beam Meter',
          });
        }
        }
  };

  const handleChangeType = (value) =>{
    setChangeType(value)
    setErrors((prevErrors) => ({ ...prevErrors, getChangeType: '' }));
  }
  const handleShiftChange = (value) =>{
    setShift(value);
    setErrors((prevErrors) => ({ ...prevErrors, getShift: '' })); 
  }

  return (
    <PaperProvider>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.row}>
          <View>
            
          </View>
          <PaperInput
            label="Document No"
            value={docno}
            style={[styles.input, { fontSize: 14 }]}
            // onChangeText={setdocno}
            error={!!errors.docno}
            mode="outlined"
            // disabled
            theme={{
              colors: {
                primary: colors.data,
                error: colors.error,
                outline: colors.data,
              },
              roundness: 4,
            }}
          />
          <PaperInput
            label="Date"
            value={date}
            style={[styles.input, { fontSize: 14 }]}
            // onChangeText={() => setShowDatePicker(true)}
            error={!!errors.date}
            // disabled
            mode="outlined"
            theme={{
              colors: {
                primary: colors.data,
                error: colors.error,
                outline: colors.data,
              },
              roundness: 4,
            }}
          />
        </View>
        <View style={styles.dp}>
        <Dropdown
            data={getLoomNoDp}
            setSelectdp={handleLoomNoChange}
            label="Loom No"
            Selectdp={getLoomNo}
            isDisable={true}
          />  
        </View>

        <View style={styles.row}>
          <PaperInput
            label="Sort No"
            value={getSortNo}
            style={[styles.input, { fontSize: 14 }]}
            // onChangeText={setSortNo}
            error={!!errors.getSortNo}
            mode="outlined"
            theme={{
              colors: {
                primary: colors.data,
                error: colors.error,
                outline: colors.data,
              },
              roundness: 4,
            }}
          />
          </View>
          <View style={styles.dp}>
          <Dropdown
              data={getChangeTypeDp}
              setSelectdp={handleChangeType}
              label="Change Type"
              Selectdp={getChangeType}
            />
             {errors.getChangeType ? <Text style={styles.errorText}>{errors.getChangeType}</Text> : null}
        </View>
        <View style={styles.dp}>
          <Dropdown
              data={getShiftDp}
              setSelectdp={handleShiftChange}
              label="Shift"
              Selectdp={getShift}
            />
             {errors.getShift ? <Text style={styles.errorText}>{errors.getShift}</Text> : null}
        </View>

        <View style={styles.dp}>
              <Dropdown
                data={getBlueToothConfigList}
                setSelectdp={handlePrinterTypeChange}
                label="Printer Type"
                Selectdp={getBlueToothConfig}
              />
              {errors.BlueToothConfig ? <Text style={styles.errorText}>{errors.BlueToothConfig}</Text> : null}
            </View>
            
        <View style={styles.row}>
          <WrapDetails loom_detail ={doffinfo.loom_detail} />
        </View>
        <Button 
          icon="content-save" 
          mode="contained" 
          style={{ backgroundColor: colors.button, marginBottom:20, borderRadius:10 }} 
          disabled={loading}
          onPress={handleSubmit}
        >
          Save
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        <Loader visible={loading} />
      </ScrollView>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
    backgroundColor: colors.background,
    marginTop:10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 5,
    backgroundColor : colors.textLight
  },
  modalItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
    borderRadius: 5,
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
    fontSize:10
  },
  dp:{
    marginBottom:20
  }
});

export default BeamKnotting;
