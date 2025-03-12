import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button, TextInput as PaperInput, Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { colors, toastConfig } from '../../config/config';
import Loader from '../../loader/Loader';
import Dropdown from '../../dropdown/Dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFromAPI, postToAPI } from '../../../apicall/apicall';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import WeftReturnList from '../weftreturn/WeftReturnList';
import { updateSavedDataAll } from './savedDataSlice';
import { useDispatch } from 'react-redux';
// import {bluetoothconfig} from '../../bluetoothPrinter/bluetoothconfig';
// import { BleManager } from 'react-native-ble-plx';
// import { format } from 'date-fns';
import { getCurrentWifiSignalStrength, CurrentWifiSignalStrength } from '../../checkNetworkStatus';
// import { generatePrintData } from '../../bluetoothPrinter/GeneratePrintWeftReturn'; 



const WeftReturnInfo = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const qrData = useSelector(state => state.QRData.data);
  const savedData = useSelector((state) => state.savedDataReturn.items);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [docno] = useState('AutoNumber');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWODet, setSelectedWODet] = useState('');
  const [selectedItemNoDet, setSelectedItemDet] = useState('');
  const [selectedProductionLoc, setSelectedProductionLoc] = useState('');
  const [selectedLoomDet, setSelectedLoomDet] = useState('');
  const [getItemDescriptionDp, setItemDescriptionDp] = useState([]);
  const [getItemDescription, setItemDescription] = useState('');
  const [getProductionLocationDp, setProductionLocationDp] = useState([]);
  const [getProductionLocation, setProductionLocation] = useState('');
  const [getWorkOrderNoDp, setWorkOrderNoDp] = useState([]);
  const [getWorkOrderNo, setWorkOrderNo] = useState('');
  const [getLoomNoDp, setLoomNoDp] = useState([]);
  const [getLoomNo, setLoomNo] = useState('');
  const [buttonUse, setButtonUse] = useState(false);
  const [getBlueToothConfig, setBlueToothConfig] = useState(1);
  const [getBlueToothConfigList, setBlueToothConfigList] = useState([]);
  const [ButtonDisable, setButtonDisable] = useState(false);
  const [ishideloomDp, setIshideloomDp] = useState(false);
  const [getRemarks, setRemarks] = useState('');
  const [getWifiSignal, setWifiSignal] = useState(0);
  const [getStatusDp, setStatusDp] = useState([]);
  const [getStatus, setStatus] = useState('');
   const [submitButtonEnable, setsubmitButtonEnable] = useState(false);

  useEffect(() => {
        const interval = setInterval(async () => {
          const signalresponse = await CurrentWifiSignalStrength();
          setWifiSignal(signalresponse);
        }, 2000);
        return () => clearInterval(interval);
      }, [])


   useEffect(() => {
        setLoading(true);
        if (Array.isArray(getLoomNoDp)) {
          if (qrData != null && getLoomNoDp.length > 0 && qrData.length < 7) {
            const result = getLoomNoDp.find(item => item.MachineNo === qrData);
            if (result) {
              setIshideloomDp(true);
              setLoomNo(result.value);
              handleLoomNoChange(result.value)
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
      }, [getLoomNo, qrData]);  


  useLayoutEffect(() => {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Text style={{ color: colors.textLight, fontWeight: 'bold', fontSize: 16 }}>Weft Return</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="wifi" size={20} color="#bfffcf" style={{ marginRight: 5 }} />
                      <Text style={{ color: '#f66d5e', fontWeight: 'bold', fontSize: 12, opacity: 1.5 }}>
                        {getWifiSignal} dBm
                      </Text>
                    </View>
                  </View>
        ),
        headerStyle: { backgroundColor: colors.header },
      });
    }, [navigation, getWifiSignal]);

  const fetchData = async () => {
     setLoading(true);
     try {
       const [response, response1, response2, response3] = await Promise.all([
         getFromAPI('/get_loomno_new?data=' + '{"weft_type" : 2}'),
         getFromAPI('/get_production_location'),
         getFromAPI('/get_work_order_no'),
         getFromAPI('/weft_return_status'),
       ]);
       setLoomNoDp(response.loomNo_New);
       setWorkOrderNoDp(response2.WorkOrderNo)
       setProductionLocationDp(response1.ProductionLocation);
       setStatusDp(response3.return_status_dp)
     } catch (error) {
       Alert.alert('Error', 'Failed to load filter data. Logout and Try Again.');
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
      setDate(date.toISOString().split('T')[0]);
      setSelectedDate(date);
    }
  };

  const handleItemChange = (selectedItem) => {
    setItemDescription(selectedItem);
    setErrors((prevErrors) => ({ ...prevErrors, descrip: '' }));
    const selectedData = getItemDescriptionDp.find(item => item.value === selectedItem);
    setSelectedItemDet(selectedData);
  };

  const handleWorkOrderNoChange = async (selectedItem) => {
    setWorkOrderNo(selectedItem);
  };

  const handleProductionLocation = (value) => {
    setProductionLocation(value);
    const selectedData = getProductionLocationDp.find(item => item.value === value);
    setSelectedProductionLoc(selectedData);
    setErrors((prevErrors) => ({ ...prevErrors, ProductionLocation: '' }));
  };

    const handleLoomNoChange = async(selectedItem) => {
      setLoomNo(selectedItem);
      const selectedData = getLoomNoDp.find(item => item.value === selectedItem);
      setSelectedLoomDet(selectedData);
      setWorkOrderNo(selectedData.WorkOrderID);
      const selectedData1 = getWorkOrderNoDp.find(item => item.value === selectedData.WorkOrderID);
      setSelectedWODet(selectedData1);
  
      const data = { WorkOrderID: selectedData.WorkOrderID};
      const encodedFilterData = encodeURIComponent(JSON.stringify(data));
      const [response] = await Promise.all([
        getFromAPI('/get_wi_item_description?data=' + encodedFilterData),
      ]);
      setItemDescriptionDp(response.ItemDescription);
      setItemDescription('');
      setErrors((prevErrors) => ({ ...prevErrors, loom_no: '' }));
      setErrors((prevErrors) => ({ ...prevErrors, WorkOrderNo: '' }));
    }


  // const navigateToCamera = () => {
  //   const newErrors = {};
  //   if (!docno) newErrors.docno = 'Document No is required';
  //   if (!date) newErrors.date = 'Date is required';
  //   if (!getWorkOrderNo) newErrors.WorkOrderNo = 'WorkOrder No is required';
  //   if (!getLoomNo) newErrors.loom_no = 'Loom No is required';
  //   if (!getItemDescription) newErrors.descrip = 'Item Description is required';
  //   if (!getProductionLocation) newErrors.ProductionLocation = 'Production Location is required';
  //   setErrors(newErrors);
  //   if (Object.keys(newErrors).length === 0) {
  //     navigation.navigate('Camera', {page : 'AddDoff'});
  //   };
  // }



  function checkIssueCone(data) {
    for (const item of data) {
      if (item.IssueCone === 0) {
        return false;
      }
    }
    return true;
  }

  function checkReturnWeight(data) {
    for (const item of data) {
      if (item.ReturnWeight === 0) {
        return false;
      }
    }
    return true;
  }

  const checkInput = () => {
    const newErrors = {};
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getWorkOrderNo) newErrors.WorkOrderNo = 'WorkOrder No is required';
    if (!getLoomNo) newErrors.loom_no = 'Loom No is required';
    if (!getItemDescription) newErrors.descrip = 'Item Description is required';
    if (!getProductionLocation) newErrors.ProductionLocation = 'Production Location is required';
    // if (!getBlueToothConfig) newErrors.BlueToothConfig = 'Printer is required';
    if (!getStatus) newErrors.Status = 'Status is required';
    setErrors(newErrors);
    return newErrors
  }

  const handleConfirmSave = async(data)=>{
        setLoading(true);
        setButtonDisable(true);
        const response = await postToAPI('/insert_weft_return', data);
        setButtonDisable(false);
        setLoading(false);
        if (response.rval > 0){
          Toast.show({
            ...toastConfig.success,
            text1: response.message,
          });
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

  const navigateToCamera = () => {
    navigation.navigate('Camera', { page: 'DoffInfo' });
  }



  const handleSubmit = async() => {
    const newErrors = {};
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getWorkOrderNo) newErrors.WorkOrderNo = 'WorkOrder No is required';
    if (!getLoomNo) newErrors.loom_no = 'Loom No is required';
    if (!getItemDescription) newErrors.descrip = 'Item Description is required';
    if (!getProductionLocation) newErrors.ProductionLocation = 'Production Location is required';
    if (!getStatus) newErrors.Status = 'Status is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // const bluetooth_conf = getBlueToothConfigList.find(item => item.value === getBlueToothConfig);
      // const res = await bluetoothconfig(bluetooth_conf, setLoading);
      const output = checkIssueCone(savedData);
      if (!output){
        Toast.show({
          ...toastConfig.error,
          text1: 'Please Add IssueCone',
        });
        return;
      }

      const output1 = checkReturnWeight(savedData);
      if (!output1){
        Toast.show({
          ...toastConfig.error,
          text1: 'Please Add ReturnWeight',
        });
        return;
      }


    const signalresponse = await getCurrentWifiSignalStrength();
    if (signalresponse.rval == 0){
      Toast.show({
        ...toastConfig.error,
        text1: signalresponse.message,
      });
      setButtonDisable(false);
      return;
    }

      const data = { WIList: savedData,  docno, date,selectedWODet, WorkOrderNo:getWorkOrderNo,selectedItemNoDet,selectedLoomDet,selectedProductionLoc,
        LoomNo: getLoomNo, ItemDescription :getItemDescription,ProductionLocation:getProductionLocation, Remarks:getRemarks || '' , status :getStatus
      }
        const printnot = false;
        if (printnot) {
          Alert.alert(
           res.message, 
            `Are you sure to Save without print`, 
            [
              { 
                text: "Cancel", 
                onPress: () =>  setButtonDisable(false), 
                style: "cancel"
              },
              { 
                text: "Save", 
                onPress: () => handleConfirmSave(data), 
              },
            ],
            { cancelable: false } 
          );
        }
        else{
            setsubmitButtonEnable(true);
            setLoading(true);
            setButtonDisable(true);
            const response = await postToAPI('/insert_weft_return', data);
            setLoading(false);
            setButtonDisable(false);
            if (response.rval > 0){
              Toast.show({
                ...toastConfig.success,
                text1: response.message,
              });
              // const bleManager = new BleManager();
              // const formattedDate = format(new Date(), 'hh:mm a');
              // const print_data = generatePrintData(
              //   response.print_data.ItemDescription,
              //   response.print_data.LotNo,
              //   response.print_data.QRCode,
              //   response.print_data.NoOfCone,
              //   response.print_data.TotalWeight
              // );
              // const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
              // await connected.discoverAllServicesAndCharacteristics();
              // await bleManager.writeCharacteristicWithResponseForDevice(
              //   bluetooth_conf.device_id,
              //   bluetooth_conf.service_id,
              //   bluetooth_conf.char_id,
              //   print_data
              // );

              // await connected.discoverAllServicesAndCharacteristics();
              // await bleManager.writeCharacteristicWithResponseForDevice(
              //   bluetooth_conf.device_id,
              //   bluetooth_conf.service_id,
              //   bluetooth_conf.char_id,
              //   print_data
              // );


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
        }
  }

   const handlePrinterTypeChange = async(value)=>{
    setBlueToothConfig(value);
    setErrors((prevErrors) => ({ ...prevErrors, BlueToothConfig: '' }));
  }

  const handleStatusChange = (value)=>{
    setStatus(value);
    dispatch(updateSavedDataAll());
    setErrors((prevErrors) => ({ ...prevErrors, Status: '' }));
  }

  return (
    <PaperProvider>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.row}>
          <PaperInput
            label="Document No"
            value={docno}
            style={[styles.input, { fontSize: 14 }]}
            error={!!errors.docno}
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
          <PaperInput
            label="Date"
            value={date}
            style={[styles.input, { fontSize: 14 }]}
            error={!!errors.date}
            mode="outlined"
            theme={{
              colors: {
                primary: colors.data,
                error: colors.error,
                outline: colors.data,
              },
              roundness: 4,
            }}
            onFocus={() => setShowDatePicker(true)}
          />
        </View>

        <View style={styles.dp}>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 320 }}>
                  <Dropdown
                    data={getLoomNoDp}
                    setSelectdp={handleLoomNoChange}
                    label="Loom No"
                    Selectdp={getLoomNo}
                    isDisable={ishideloomDp}
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
            data={getWorkOrderNoDp}
            setSelectdp={handleWorkOrderNoChange}
            label="WorkOrder No"
            Selectdp={getWorkOrderNo}
            isDisable={true}
          />
          {errors.WorkOrderNo ? <Text style={styles.errorText}>{errors.WorkOrderNo}</Text> : null}
        </View>

        <View style={styles.dp}>
          <Dropdown
            data={getItemDescriptionDp}
            setSelectdp={handleItemChange}
            label="Item Description"
            Selectdp={getItemDescription}
          />
          {errors.descrip ? <Text style={styles.errorText}>{errors.descrip}</Text> : null}
        </View>

        <View style={styles.dp}>
          <Dropdown
            data={getProductionLocationDp}
            setSelectdp={handleProductionLocation}
            label="Production Location"
            Selectdp={getProductionLocation}
          />
          {errors.ProductionLocation && <Text style={styles.errorText}>{errors.ProductionLocation}</Text>}
        </View>

        <View style={styles.dp}>
          <Dropdown
            data={getStatusDp}
            setSelectdp={handleStatusChange}
            label="Status"
            Selectdp={getStatus}
          />
          {errors.Status && <Text style={styles.errorText}>{errors.Status}</Text>}
        </View>


        {/* <View style={styles.dp}>
              <Dropdown
                data={getBlueToothConfigList}
                setSelectdp={handlePrinterTypeChange}
                label="Printer Type"
                Selectdp={getBlueToothConfig}
              />
              {errors.BlueToothConfig ? <Text style={styles.errorText}>{errors.BlueToothConfig}</Text> : null}
        </View> */}

         <View style={styles.row}>
                       <PaperInput
                                label="Remarks"
                                value={getRemarks}
                                style={[styles.input, { fontSize: 14 }]}
                                onChangeText={(text) => {
                                  setRemarks(text);
                                  setErrors((prevErrors) => ({ ...prevErrors, remarks: '' }));
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
                {errors.remarks && <Text style={styles.errorText}>{errors.remarks}</Text>}

        {/* <View style={styles.row}>
          <PaperInput
            label="QR Data"
            value={qrData}
            style={[styles.input, { fontSize: 14 }]}
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
          <View style={{
            padding: 0, marginTop: 4
          }}>
            <Icon onPress={navigateToCamera} name="qr-code-outline" size={55} color={colors.header} />
          </View>
        </View> */}

        <View>
          <WeftReturnList getItemDescription={getItemDescription} 
          qrData={''} errors={errors} checkInput={checkInput} 
          ProductionLocation={getProductionLocation} 
          workorderID ={getWorkOrderNo}
          loomID ={selectedLoomDet.MachineID}
          getStatus ={getStatus}
          navigateToCamera={navigateToCamera}/>
        </View>

        <Button
          icon="content-save"
          mode="contained"
          style={{ backgroundColor: colors.button, marginBottom: 20, borderRadius: 10 }}
          disabled={submitButtonEnable}
          onPress={handleSubmit}
        >
          Save
        </Button>
        <View>
         <Text>               </Text>
        </View>


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
    marginTop: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    backgroundColor: 'red', // Optional background color
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 5,
    backgroundColor: colors.textLight,
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 10,
  },
  dp: {
    marginBottom: 20,
  },
});

export default WeftReturnInfo;
