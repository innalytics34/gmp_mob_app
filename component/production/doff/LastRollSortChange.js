import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView  } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput as PaperInput, Button, Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { colors, toastConfig } from '../../config/config';
import Loader from '../../loader/Loader';
import Dropdown from '../../dropdown/Dropdown';
import LoomMapingList from './LoomMapingList';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getFromAPI, postToAPI } from '../../../apicall/apicall';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';



const BeamKnotting = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const tableData = useSelector(state => state.LMList.tableData);
  const { doffinfo = {}} = route.params || {}; 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [docno, setdocno] = useState('AutoNumber');
  const [date, setdate] = useState(new Date().toISOString().split('T')[0]);
  const [getWorkOrderNo, setWorkOrderNo] = useState('');
  const [getWorkOrderNoDp, setWorkOrderNoDp] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorkOrderNoDet, setSelectedLoomDet] = useState('');
  const [getSortNo, setSortNo] = useState();
  const [getStatus, setStatus] = useState(1);
  const [getStatusDp, setStatusDp] = useState([]);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: colors.textLight, fontWeight: 'bold', fontSize: 16 }}>Last Roll SortChange</Text>
      ),
      headerStyle: { backgroundColor: colors.header },
    });
  }, [navigation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [response, response1] = await Promise.all([
        getFromAPI('/get_last_roll_short_change_details'), 
        getFromAPI('/get_Status'),
      ]);
      setWorkOrderNoDp(response.LastRollShortChange);
      setStatusDp(response1.Status);
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

  const handleWorkOrderNoChange = async (selectedLoom) => {
    setWorkOrderNo(selectedLoom);
    const selectedData = getWorkOrderNoDp.find(item => item.value === selectedLoom);
    setErrors((prevErrors) => ({ ...prevErrors, WorkOrderNo: '' }));
    setSortNo(selectedData.SortCode)
    setSelectedLoomDet(selectedData)
 
  };

  const checkLoomMapping = (data) => {
    return data.some(item => !item.loom_uid || !item.MachineNo);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!docno) newErrors.docno = 'Document No is required';
    if (!date) newErrors.date = 'Date is required';
    if (!getWorkOrderNo) newErrors.WorkOrderNo = 'WorkOrder No is required';
    if (!getStatus) newErrors.status = 'Status is required';
    setErrors(newErrors);
      if (Object.keys(newErrors).length === 0){
        if (tableData.length > 0){
          const hasEmptyValues = checkLoomMapping(tableData);
          if (!hasEmptyValues){
          const doffinfowithLRSC = {
            LRSortChange: {docno,date,status: getStatus,WorkOrderNoDet:selectedWorkOrderNoDet,
              SortNo: getSortNo,LMList: tableData}}
          navigation.navigate('SortChangeLR3', {doffinfowithLRSC, doffinfo});
          }
          else{
            Toast.show({
              ...toastConfig.error,
              text1:'Please Map Loom',
            });
          }       
        }
        else{
          Toast.show({
            ...toastConfig.error,
            text1:'Please Add Loom Mapping List',
          });
        }  
      }
   
  };

  const handleStatusChange = (value)=>{
     setStatus(value);
     setErrors((prevErrors) => ({ ...prevErrors, status: '' }));
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
            data={getWorkOrderNoDp}
            setSelectdp={handleWorkOrderNoChange}
            label="WorkOrder No"
            Selectdp={getWorkOrderNo}
            isDisable={false}
          />  
         {errors.WorkOrderNo ? <Text style={styles.errorText}>{errors.WorkOrderNo}</Text> : null}
        </View>

        <View style={styles.dp}>
            <PaperInput
                label="WorkOrder Date"
                value={date}
                style={[styles.input, { fontSize: 14 }]}
                // onChangeText={() => setShowDatePicker(true)}
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
            />
        {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
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
          {errors.getSortNo ? <Text style={styles.errorText}>{errors.getSortNo}</Text> : null}
          </View>

          <View style={styles.dp}>
        <Dropdown
            data={getStatusDp}
            setSelectdp={handleStatusChange}
            label="Status"
            Selectdp={getStatus}
            isDisable={false}
          />  
           {errors.status ? <Text style={styles.errorText}>{errors.status}</Text> : null}
        </View>
    
        <View style={styles.row}>
          <LoomMapingList getSortNo={getSortNo} loom_detail = {doffinfo.loom_detail}/>
        </View>
        <Button 
          icon="content-save" 
          mode="contained" 
          style={{ backgroundColor: colors.button, marginBottom:20, borderRadius:10 }} 
          disabled={loading}
          onPress={handleSubmit}
        >
          Continue
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
