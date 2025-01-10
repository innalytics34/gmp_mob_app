import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
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
import { bluetoothconfig } from '../../bluetoothPrinter/bluetoothconfig';
import { getCurrentWifiSignalStrength, CurrentWifiSignalStrength } from '../../checkNetworkStatus';
import Icon from 'react-native-vector-icons/Ionicons';


const BeamKnotting = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const doffinfo = useSelector((state) => state.doffCommon.doffinfo);
  const warpDetails = useSelector(state => state.warpDetails.warpDetails);
  const warpDetailsInfo = useSelector(state => state.doffCommon.warpSelectedInfo);
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
  const [ButtonDisable, setButtonDisable] = useState(false);
  const [getWifiSignal, setWifiSignal] = useState(0);

   useEffect(() => {
      const interval = setInterval(async () => {
        const signalresponse = await CurrentWifiSignalStrength();
        setWifiSignal(signalresponse);
      }, 2000);
      return () => clearInterval(interval);
    }, [])


  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Text style={{ color: colors.textLight, fontWeight: 'bold', fontSize: 16 }}>Beam Knotting</Text>
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
      const data = { MachineID: doffinfo.loom_detail.MachineID, WorkOrder_id: doffinfo.loom_detail.WorkOrderID }
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
      // const isSelectedTypeEmpty = () => {
      //   return warpDetailsInfo.every(entry => Object.keys(entry.selectedType).length === 0);
      // };
      // console.log(isSelectedTypeEmpty(), warpDetailsInfo,"--------")
      // if (warpDetails.length == 0 && isSelectedTypeEmpty()){
      //   dispatch(setWarpDetails(response3.beam_knotting[0].Warp));
      // } 
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

  const handleLoomNoChange = async (selectedLoom) => {
    setLoomNo(selectedLoom);
    const selectedData = getLoomNoDp.find(item => item.value === selectedLoom);
    setSelectedLoomDet(selectedData)
    const data = { UID: selectedData.UID, Description: selectedData.Description }
    // const encodedFilterData = encodeURIComponent(JSON.stringify(data));
    // const response = await getFromAPI('/get_beam_weft_details?data=' + encodedFilterData);
    // if (selectedData) {
    //   dispatch(setWarpDetails(sampledata));
    // } else {
    //   dispatch(setWarpDetails([]));
    // }
  };


  const handlePrinterTypeChange = async (value) => {
    setBlueToothConfig(value);
    setErrors((prevErrors) => ({ ...prevErrors, BlueToothConfig: '' }));
  }

  const validateRollNo = async () => {
    const data = { roll_no: doffinfo.RollNo };
    const encodedFilterData = encodeURIComponent(JSON.stringify(data));
    const count = await getFromAPI('/validate_roll_no?data=' + encodedFilterData);
    return count == 0 ? true : false
  }



  const handleConfirmSave = async (data) => {
    const signalresponse = await getCurrentWifiSignalStrength();
                if (signalresponse.rval == 0){
                  Toast.show({
                    ...toastConfig.error,
                    text1: signalresponse.message,
                  });
                  setButtonDisable(false);
                 return;
                }
    setLoading(true);
    const response = await postToAPI('/insert_doff_info', data);
    setLoading(false);
    if (response.rval > 0) {
      Toast.show({
        ...toastConfig.success,
        text1: response.message,
      });
      setTimeout(() => {
        setButtonDisable(false);
        navigation.navigate('Admin');
      }, 1000);
    }
    else {
      setButtonDisable(false);
      Toast.show({
        ...toastConfig.error,
        text1: response.message,
      });
    }
  }


  const handleSubmit = async () => {
     const signalresponse = await getCurrentWifiSignalStrength();
        if (signalresponse.rval == 0){
          Toast.show({
            ...toastConfig.error,
            text1: signalresponse.message,
          });
          setButtonDisable(false);
         return;
        }
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
      beam_knotting: {
        ChangeType: getChangeType, Shift: getShift, docno, date,
        SortNo: getSortNo, WarpDetails: warpDetails, WeftDetails: getWeftDetails,
        knotting_info: getBeamKnotting,
      },
      doffinfo: doffinfo, page_type: 1
    }
    if (Object.keys(newErrors).length === 0) {
      if (!await validateRollNo()) {
        Toast.show({
          ...toastConfig.error,
          text1: 'Roll No Already Taken!',
        });
        return;
      }

      if (warpDetails.length == 2){
        if(!warpDetails[1].selectedType){
         Toast.show({
           ...toastConfig.error,
           text1: 'Please Add BeamNo, SetNo and Beam Meter!',
         });
         return;
        }
       }
       

      if (warpDetails[0].selectedType) {
        setLoading(true);
        setButtonDisable(true);
        const bluetooth_conf = getBlueToothConfigList.find(item => item.value === getBlueToothConfig);
        const res = await bluetoothconfig(bluetooth_conf, setLoading);
        if (res.val == 0) {
          Alert.alert(
            res.message,
            `Are you sure to Save without print`,
            [
              {
                text: "Cancel",
                onPress: () => setButtonDisable(false),
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
        else {
          setLoading(true);
          const response = await postToAPI('/insert_doff_info', data);
          setLoading(false);
          if (response.rval > 0) {
            Toast.show({
              ...toastConfig.success,
              text1: response.message,
            });
            const bleManager = new BleManager();
            for (const [index, item] of response.dataprint.entries()) {
              const formattedDate = format(new Date(), 'hh:mm a');
            const print_data = generatePrintData(item.RollNo + ' M-' + String(item.DoffMeter) + ' ' + item.roll_type_sortcode, ' ' + item.SortNo + ' B-' + item.BeamNumber + ' ' + formattedDate, item.RollNo, index);
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
                print_data);
            }
            bleManager.destroy()
            setTimeout(() => {
              setButtonDisable(false);
              navigation.navigate('Admin');
            }, 1000);
          }
          else {
            setButtonDisable(false);
            Toast.show({
              ...toastConfig.error,
              text1: response.message,
            });
          }
        }
      }
      else {
        Toast.show({
          ...toastConfig.error,
          text1: 'Please Add BeamNo, SetNo and Beam Meter',
        });
      }
    }
  };

  const handleChangeType = (value) => {
    setChangeType(value)
    setErrors((prevErrors) => ({ ...prevErrors, getChangeType: '' }));
  }
  const handleShiftChange = (value) => {
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
            onChangeText={setSortNo}
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
          <WrapDetails loom_detail={doffinfo.loom_detail} />
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
      <Toast ref={(ref2) => Toast.setRef(ref2)} />
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
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 5,
    backgroundColor: colors.textLight
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
    fontSize: 10
  },
  dp: {
    marginBottom: 20
  }
});

export default BeamKnotting;
