import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
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
import {bluetoothconfig} from '../../bluetoothPrinter/bluetoothconfig';
import { BleManager } from 'react-native-ble-plx';
import { format } from 'date-fns';
import { getCurrentWifiSignalStrength } from '../../checkNetworkStatus';
import { generatePrintData } from '../../bluetoothPrinter/GeneratePrintWeftReturn'; 


const WeftReturnInfo = () => {
  const navigation = useNavigation();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: colors.textLight, fontWeight: 'bold', fontSize: 16 }}>Weft Return</Text>
      ),
      headerStyle: { backgroundColor: colors.header },
    });
  }, [navigation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [response, response1, response2] = await Promise.all([
        getFromAPI('/get_work_order_no'),
        getFromAPI('/get_production_location'),
        getFromAPI('/get_bluetooth_config')
      ]);
      setWorkOrderNoDp(response.WorkOrderNo);
      setProductionLocationDp(response1.ProductionLocation);
      setBlueToothConfigList(response2.bluetooth_config);
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
    setErrors((prevErrors) => ({ ...prevErrors, WorkOrderNo: '' }));
    const selectedData = getWorkOrderNoDp.find(item => item.value === selectedItem);
    setSelectedWODet(selectedData);
    const data = { WorkOrderID: selectedData.UID, LocationID: 1006297 };
    const encodedFilterData = encodeURIComponent(JSON.stringify(data));
    const data1 = { WorkOrderID: selectedData.UID };
    const encodedFilterData1 = encodeURIComponent(JSON.stringify(data1));
    const [response, response1] = await Promise.all([
      getFromAPI('/get_wi_item_description?data=' + encodedFilterData),
      getFromAPI('/get_loom_no?data=' + encodedFilterData1),
    ]);
    setItemDescriptionDp(response.ItemDescription);
    setLoomNoDp(response1.LoomNo);
  };

  const handleProductionLocation = (value) => {
    setProductionLocation(value);
    const selectedData = getProductionLocationDp.find(item => item.value === value);
    setSelectedProductionLoc(selectedData);
    setErrors((prevErrors) => ({ ...prevErrors, ProductionLocation: '' }));
  };

  const handleLoomNoChange = (selectedItem) => {
    setLoomNo(selectedItem);
    const selectedData = getLoomNoDp.find(item => item.value === selectedItem);
    setSelectedLoomDet(selectedData);
    setErrors((prevErrors) => ({ ...prevErrors, loom_no: '' }));
  }
 

  const navigateToCamera = () => {
    const newErrors = {};
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getWorkOrderNo) newErrors.WorkOrderNo = 'WorkOrder No is required';
    if (!getLoomNo) newErrors.loom_no = 'Loom No is required';
    if (!getItemDescription) newErrors.descrip = 'Item Description is required';
    if (!getProductionLocation) newErrors.ProductionLocation = 'Production Location is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('Camera', {page : 'AddDoff'});
    };
  }



  function checkIssueCone(data) {
    for (const item of data) {
      if (item.IssueCone === 0) {
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
    if (!getBlueToothConfig) newErrors.BlueToothConfig = 'Printer is required';
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


  const handleSubmit = async() => {
    const newErrors = {};
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getWorkOrderNo) newErrors.WorkOrderNo = 'WorkOrder No is required';
    if (!getLoomNo) newErrors.loom_no = 'Loom No is required';
    if (!getItemDescription) newErrors.descrip = 'Item Description is required';
    if (!getProductionLocation) newErrors.ProductionLocation = 'Production Location is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const bluetooth_conf = getBlueToothConfigList.find(item => item.value === getBlueToothConfig);
      const res = await bluetoothconfig(bluetooth_conf, setLoading);
      const output = checkIssueCone(savedData);

      if (!output){
        Toast.show({
          ...toastConfig.error,
          text1: 'Please Add IssueCone',
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
        LoomNo: getLoomNo, ItemDescription :getItemDescription,ProductionLocation:getProductionLocation 
      }

        if (res.val == 0) {
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
              const bleManager = new BleManager();
              const formattedDate = format(new Date(), 'hh:mm a');
              const print_data = generatePrintData(
                response.print_data.ItemDescription,
                response.print_data.LotNo,
                response.print_data.QRCode,
                response.print_data.NoOfCone,
                response.print_data.TotalWeight
              );
              const connected = await bleManager.connectToDevice(bluetooth_conf.device_id);
              await connected.discoverAllServicesAndCharacteristics();
              await bleManager.writeCharacteristicWithResponseForDevice(
                bluetooth_conf.device_id,
                bluetooth_conf.service_id,
                bluetooth_conf.char_id,
                print_data
              );

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
          <Dropdown
            data={getWorkOrderNoDp}
            setSelectdp={handleWorkOrderNoChange}
            label="WorkOrder No"
            Selectdp={getWorkOrderNo}
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
            data={getLoomNoDp}
            setSelectdp={handleLoomNoChange}
            label="Loom No"
            Selectdp={getLoomNo}
          />
          {errors.loom_no ? <Text style={styles.errorText}>{errors.loom_no}</Text> : null}
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
                data={getBlueToothConfigList}
                setSelectdp={handlePrinterTypeChange}
                label="Printer Type"
                Selectdp={getBlueToothConfig}
              />
              {errors.BlueToothConfig ? <Text style={styles.errorText}>{errors.BlueToothConfig}</Text> : null}
        </View>

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
          <WeftReturnList getItemDescription={getItemDescription} qrData={qrData} errors={errors} checkInput={checkInput} ProductionLocation={getProductionLocation} navigateToCamera={navigateToCamera}/>
        </View>

        <Button
          icon="content-save"
          mode="contained"
          style={{ backgroundColor: colors.button, marginBottom: 20, borderRadius: 10 }}
          disabled={ButtonDisable}
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
