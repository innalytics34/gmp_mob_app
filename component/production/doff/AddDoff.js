import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput as PaperInput, Button, Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { colors, toastConfig } from '../../config/config';
import Loader from '../../loader/Loader';
import Dropdown from '../../dropdown/Dropdown';
import BeamDetails from './BeamDetails';
import WeftDetails from './WeftDetails';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFromAPI } from '../../../apicall/apicall';
import { setWarpDetails } from './warpSlice';
import { useDispatch } from 'react-redux';
import { resetTableData } from './LMListSlice';
import { postToAPI } from '../../../apicall/apicall';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { BleManager } from 'react-native-ble-plx';
import { generatePrintData } from '../../bluetoothPrinter/generatePrintData'; 
import { format } from 'date-fns';
import { setdoffinfo } from '../doff/commonSlice';
import {resetQrData} from '../../barcodescan/QrSlice';


const AddDoff = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const qrDataDoff = useSelector(state => state.QRData.data);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [docno, setdocno] = useState('AutoNumber');
  const [date, setdate] = useState(new Date().toISOString().split('T')[0]);
  const [getLoomNo, setLoomNo] = useState(qrDataDoff);
  const [getLoomNoDp, setLoomNoDp] = useState([]);
  const [getRollType, setRollType] = useState('');
  const [getRollTypeDp, setRollTypeDp] = useState([]);
  const [getRollNo, setRollNo] = useState('');
  const [weightPerMtr, setweightPerMtr] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [getBeamDetails, setBeamDetails] = useState([]);
  const [getWeftDetails, setWeftDetails] = useState([]);
  const [selectedLoomNoDet, setSelectedLoomDet] = useState('');
  const [doffMeter, setDoffMeter] = useState('');
  const [buttonUse, setButtonUse] = useState(false);
  const [getBlueToothConfig, setBlueToothConfig] = useState(1);
  const [getBlueToothConfigList, setBlueToothConfigList] = useState([]);
  const [ishideloomDp, setIshideloomDp] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: colors.textLight, fontWeight: 'bold', fontSize: 16 }}>Doff Info</Text>
      ),
      headerStyle: { backgroundColor: colors.header },
    });
  }, [navigation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [response, response1, response2] = await Promise.all([
        getFromAPI('/loom_no_dropdown'),
        getFromAPI('/rolltype_dropdown'),
        getFromAPI('/get_bluetooth_config')
      ]);
      setLoomNoDp(response.document_info);
      setRollTypeDp(response1.roll_type);
      setBlueToothConfigList(response2.bluetooth_config)
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

  useEffect(() => {
    setLoading(true);
    if (Array.isArray(getLoomNoDp)) {
          if (qrDataDoff != null && getLoomNoDp.length > 0 &&  qrDataDoff.length < 10){
            const result = getLoomNoDp.find(item => item.Description === qrDataDoff);
            if (result) {
              setIshideloomDp(true);
              setLoomNo(result.value); 
            } else {
              Toast.show({
                ...toastConfig.error,
                text1: 'QR Code Data not Found',
              });
              setIshideloomDp(false);
            }
          }  
        } 
        setLoading(false);
  }, [getLoomNo, qrDataDoff]);

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setdate(date.toISOString().split('T')[0]);
      setSelectedDate(date);
    }
  };

  const handleLoomNoChange = async (selectedLoom) => {
    setErrors((prevErrors) => ({ ...prevErrors, loomNo: '' }));
    setLoomNo(selectedLoom);
    const selectedData = getLoomNoDp.find(item => item.value === selectedLoom);
    setSelectedLoomDet(selectedData)
    const data = { UID: selectedData.UID, Description: selectedData.Description }
    const encodedFilterData = encodeURIComponent(JSON.stringify(data));
    const response = await getFromAPI('/get_beam_weft_details?data=' + encodedFilterData);
    if (selectedData) {
      setweightPerMtr(response.WeightPerMeter.toString());
      setBeamDetails(response.beam_details);
      setWeftDetails(response.weft_details);
    } else {
      setRollNo('');
      setBeamDetails([]);
      setWeftDetails([]);
      setweightPerMtr('');
    }
  };

  const validateRollNo = async () => {
    const data = { roll_no: getRollNo };
    const encodedFilterData = encodeURIComponent(JSON.stringify(data));
    const count = await getFromAPI('/validate_roll_no?data=' + encodedFilterData);
    return count == 0 ? true : false
  }

  const handleBluetoothState = async (bleManager) => {
    const currentState = await bleManager.state();
    return currentState;
};

  const handleSave = async (doffinfo) => {
    const bleManager = new BleManager();
    const blueStat = await handleBluetoothState(bleManager);
    if (blueStat == 'PoweredOn'){
      const data = { doffinfo, page_type: 0 }
      setLoading(true);
      const response = await postToAPI('/insert_doff_info', data);
      setLoading(false);
      if (response.rval > 0) {
        Toast.show({
          ...toastConfig.success,
          text1: response.message,
        });
        const formattedDate = format(new Date(), 'hh:mm a');
        const print_data =  generatePrintData(getRollNo + ' M-' + String(doffMeter) +  ' ' + formattedDate, '  ' + selectedLoomNoDet.SortNo + ' B-' + selectedLoomNoDet.BeamNo, getRollNo)
        const bluetooth_conf = getBlueToothConfigList.find(item => item.value === getBlueToothConfig);
        const isConnected = await bleManager.isDeviceConnected(bluetooth_conf.device_id);
        if (!isConnected){
            const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
            await connected.discoverAllServicesAndCharacteristics();
            if (response.dataprint.length> 0){
              for (const item of response.dataprint) {
                const formattedDate1 = format(new Date(), 'hh:mm a');
                const print_data1 = generatePrintData(item.RollNo + ' M-' + String(doffMeter) + ' ' + formattedDate1, ' ' + item.SortNo + ' B-' + selectedLoomNoDet.BeamNo, item.RollNo);
                
                await bleManager.writeCharacteristicWithResponseForDevice(
                  bluetooth_conf.device_id,
                  bluetooth_conf.service_id,
                  bluetooth_conf.char_id,
                  print_data1
                );
                
                await bleManager.writeCharacteristicWithResponseForDevice(
                  bluetooth_conf.device_id,
                  bluetooth_conf.service_id,
                  bluetooth_conf.char_id,
                  print_data1
                );
              }
              
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
        else {
          const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
            await connected.discoverAllServicesAndCharacteristics();
            if (response.dataprint.length> 0){
              for (const item of response.dataprint) {
                const formattedDate1 = format(new Date(), 'hh:mm a');
                const print_data1 = generatePrintData(item.RollNo + ' M-' + String(doffMeter) + ' ' + formattedDate1, ' ' + item.SortNo + ' B-' + selectedLoomNoDet.BeamNo, item.RollNo);
              
                await bleManager.writeCharacteristicWithResponseForDevice(
                  bluetooth_conf.device_id,
                  bluetooth_conf.service_id,
                  bluetooth_conf.char_id,
                  print_data1
                );
                
                await bleManager.writeCharacteristicWithResponseForDevice(
                  bluetooth_conf.device_id,
                  bluetooth_conf.service_id,
                  bluetooth_conf.char_id,
                  print_data1
                );
              }
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
        }, 1000);
      }
      else {
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

  function checkBalanceBeam(data, type) {
    for (let item of data) {
      const result = item.BalanceBeamMeter - doffMeter;
      if (result < 0 || result > 750 && type == 1) {
        return { success: false, result };  
      }
      if (result < 0 && type == 0) {
        return { success: false, result };  
      }
    }
    return { success: true }; 
  }

  const handleSubmit = async () => {
    const newErrors = {};
    dispatch(setWarpDetails([]));
    dispatch(resetTableData());
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getLoomNo) newErrors.loomNo = 'Loom No is required';
    if (!getRollNo) newErrors.rollNo = 'Roll No is required';
    if (!getRollType) newErrors.rollType = 'Roll Type is required';
    if (!weightPerMtr) newErrors.weightPerMtr1 = 'Weight Per Meter is required';
    if (!doffMeter) newErrors.doffMeter = 'Doff Meter is required';
    if (buttonUse) if (!getBlueToothConfig) newErrors.BlueToothConfig = 'Printer is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (!await validateRollNo()) {
        Toast.show({
          ...toastConfig.error,
          text1: 'Roll No Already Taken!',
        });
        return;
      }
      const doffinfo = {
        docno, date, loom_detail: selectedLoomNoDet, BeamDetails: getBeamDetails,
        WeftDetails: getWeftDetails, RollType: getRollType, weightPerMtr: weightPerMtr, RollNo: getRollNo,
        DoffMeter: doffMeter
      }
      const selectedData = getRollTypeDp.find(item => item.value === getRollType);
      if (selectedData) {
        const roll_type = selectedData.Description
        if (roll_type == 'Beam Knotting') {
          const bal_beam_stat =  checkBalanceBeam(getBeamDetails, 1);
          if (bal_beam_stat.success){
            dispatch(setdoffinfo(doffinfo));
            dispatch(resetQrData());
            navigation.navigate('BeamKnotting', { doffinfo });
          }
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
        }


        else if (roll_type == 'Single Beam Knotting') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 1)
          if (bal_beam_stat.success){
            dispatch(setdoffinfo(doffinfo));
            navigation.navigate('SingleBeamKnotting', { doffinfo });
          }
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
        }


        else if (roll_type == 'Last Roll SortChange') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 1)
          if (bal_beam_stat.success){
            dispatch(setdoffinfo(doffinfo));
            navigation.navigate('LastRollSortChange', { doffinfo });
          }  
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          } 
        }


        else if (roll_type == 'Sort Change & Beam Change') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 1)
          if (bal_beam_stat.success){
            dispatch(setdoffinfo(doffinfo));
            navigation.navigate('ScBc', { doffinfo });
          }  
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
        }


        else if (roll_type == 'Checking Roll') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 0)
          if (bal_beam_stat.success){
            handleSave(doffinfo);
          }
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
          
        }


        else if (roll_type == 'First Roll') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 0)
          if (bal_beam_stat.success){
            handleSave(doffinfo);
          }
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
        }


        else if (roll_type == 'Normal') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 0)
          if (bal_beam_stat.success){
            handleSave(doffinfo);
          }
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
        }

        else if (roll_type == 'Sample Roll') {
          const bal_beam_stat = checkBalanceBeam(getBeamDetails, 0)
          if (bal_beam_stat.success){
            handleSave(doffinfo);
          }
          else{
            if(bal_beam_stat.result < 0){
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not Minus Value',
              });
            }
            else{
              Toast.show({
                ...toastConfig.error,
                text1: 'Balance beam meter is not greater then 750',
              });
            }
          }
        }

      }
    }
  };

  const handleRollTypeChange = (value) => {
    const exists = [1006194, 1006195, 1006197, 1006198].includes(value);
    if (qrDataDoff != null){
      handleLoomNoChange(qrDataDoff)
    }
    setRollType(value);
    setButtonUse(exists);
    setErrors((prevErrors) => ({ ...prevErrors, rollType: '' }));
  };

  const navigateToCamera = () => {
      navigation.navigate('Camera', {page : 'DoffInfo'});
  }

  const handlePrinterTypeChange = async(value)=>{
    setBlueToothConfig(value);
    setErrors((prevErrors) => ({ ...prevErrors, BlueToothConfig: '' }));
  }

  return (
    <PaperProvider>
      <FlatList
        ListHeaderComponent={
          <View style={styles.scrollContainer}>
            <View style={styles.row}>
              <View>

              </View>
              <PaperInput
                label="Document No"
                value={docno}
                style={[styles.input, { fontSize: 14 }]}
                // onChangeText={setdocno}
                mode="outlined"
                theme={{
                  colors: {
                    primary: colors.data,
                    error: colors.error,
                    outline: colors.data,
                    disabled: 'red',
                  },
                  roundness: 4,
                }}
              />
              {errors.docno ? <Text style={styles.errorText}>{errors.docno}</Text> : null}

              <PaperInput
                label="Date"
                value={date}
                style={[styles.input, { fontSize: 14 }]}
                // onChangeText={() => setShowDatePicker(true)}
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
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

            </View>
            <View style={styles.dp}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 320 }}>
                  <Dropdown
                    data={getLoomNoDp}
                    setSelectdp={handleLoomNoChange}
                    label="Loom No"
                    Selectdp={getLoomNo}
                    isDisable = {ishideloomDp}
                  />
                </View>
                <View style={{
                  padding: 0, marginTop: 11
                }}>
                   <TouchableOpacity>
                        <Icon onPress={navigateToCamera} name="qr-code-outline" size={50} color={colors.header} />
                    </TouchableOpacity>
                </View>
              </View>
              {errors.loomNo ? <Text style={styles.errorText}>{errors.loomNo}</Text> : null}
            </View>
            <View style={styles.dp}>
              <Dropdown
                data={getRollTypeDp}
                setSelectdp={handleRollTypeChange}
                label="Roll Type"
                Selectdp={getRollType}
              />
              {errors.rollType ? <Text style={styles.errorText}>{errors.rollType}</Text> : null}
            </View>

            <View style={styles.row}>
              <PaperInput
                label="Roll No"
                value={getRollNo}
                style={[styles.input, { fontSize: 14 }]}
                onChangeText={(text) => {
                  setRollNo(text);
                  setErrors((prevErrors) => ({ ...prevErrors, rollNo: '' }));
                }}
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
            {errors.rollNo ? <Text style={styles.errorText}>{errors.rollNo}</Text> : null}

            <View style={styles.row}>
              <PaperInput
                label="Doff Meter"
                value={doffMeter}
                style={[styles.input, { fontSize: 14 }]}
                onChangeText={(text) => {
                  setDoffMeter(text.replace(/[- #*;,<>\{\}\[\]\\\/]/gi, ''));
                  setErrors((prevErrors) => ({ ...prevErrors, doffMeter: '' }));
                }}
                mode="outlined"
                keyboardType="number-pad"
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
            {errors.doffMeter ? <Text style={styles.errorText}>{errors.doffMeter}</Text> : null}


            <View style={styles.row}>
              <PaperInput
                label="Weight Per Meter"
                value={weightPerMtr}
                style={[styles.input, { fontSize: 14 }]}
                // onChangeText={(text) => {
                //   setweightPerMtr(text);
                //   setErrors((prevErrors) => ({ ...prevErrors, weightPerMtr1: '' }));
                // }} 
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
            {/* {errors.weightPerMtr1 ? <Text style={styles.errorText}>{errors.weightPerMtr1}</Text> : null} */}

            { buttonUse && <View style={styles.dp}>
              <Dropdown
                data={getBlueToothConfigList}
                setSelectdp={handlePrinterTypeChange}
                label="Printer Type"
                Selectdp={getBlueToothConfig}
              />
              {errors.BlueToothConfig ? <Text style={styles.errorText}>{errors.BlueToothConfig}</Text> : null}
            </View>}

            <View style={styles.row}>
              <BeamDetails getBeamDetails={getBeamDetails} doffMeter={doffMeter}/>
            </View>
            <View style={styles.row}>
              <WeftDetails getWeftDetails={getWeftDetails} />
            </View>
            <Button
              icon="content-save"
              mode="contained"
              style={{ backgroundColor: colors.button, marginBottom: 20, borderRadius: 10 }}
              disabled={loading}
              onPress={handleSubmit}
            >
              {buttonUse ? 'Save' : 'Continue'}
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
          </View>
        }
      />
      <Toast ref={(ref1) => Toast.setRef(ref1)} />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 10,
    backgroundColor: colors.background,
    marginTop: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginRight: 5,
    backgroundColor: colors.textLight
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 10
  },
  dp: {
    marginBottom: 20
  }
});

export default AddDoff;
