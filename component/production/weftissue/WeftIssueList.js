import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Button, Modal, Text, FlatList, TouchableOpacity } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon1 from 'react-native-vector-icons/AntDesign';
import { colors, toastConfig } from '../../config/config';
import { CheckBox } from 'react-native-elements';
import { getFromAPI } from '../../../apicall/apicall';
import { useDispatch, useSelector } from 'react-redux';
import { appendSavedData, resetSavedData, deleteSavedData } from './savedDataSlice';
import { resetQrData } from '../../barcodescan/QrSlice';
import Toast from 'react-native-toast-message';
import EditIssueCone from '../weftissue/EditIssueCone';

const WeftIssueList = React.memo(({ getItemDescription, qrData, errors, checkInput, navigateToCamera, getProductionLocation }) => {
  const dispatch = useDispatch();
  const savedData = useSelector((state) => state.savedData.items);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [getWIList, setWIList] = useState([]);

  const tableHead = ['', 'LotNo', 'StockCone', 'ConeWeight', 'StockQty', 'IssueCone', 'IssueQty'];
  const widthArr = [35, 100, 100, 100, 100, 120, 140];


  useEffect(() => {
    const checkedItems = savedData.map(item => item.QRCode);
    setSelectedItems(checkedItems);
  }, [savedData]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (qrData && qrData !== '' && qrData !== null) {
  //       const isAlreadyScanned = savedData.some(item => item.QRCode === qrData);
  //       if (isAlreadyScanned) {
  //         dispatch(resetQrData());
  //         Toast.show({
  //           ...toastConfig.error,
  //           text1: 'QR Already Taken!',
  //         });
  //       } else {
  //         const data = { ItemDescriptionUID: getItemDescription, LocationID: getProductionLocation, QRCode: qrData };
  //         const encodedFilterData = encodeURIComponent(JSON.stringify(data));
  //         const response = await getFromAPI(`/get_weft_issue_details?data=${encodedFilterData}`);
  //         if (response && response.WeftIssueDetails.length > 0){
  //           const isAlreadyScanned = savedData.some(item => item.QRCode === qrData);
  //           dispatch(appendSavedData(response.WeftIssueDetails));
  //           dispatch(resetQrData());
  //           Toast.show({
  //             ...toastConfig.success,
  //             text1: 'Data Added to List',
  //           });
  //         }
  //         else{
  //           Toast.show({
  //             ...toastConfig.error,
  //             text1: 'Please Scan Valid QR',
  //           });
  //           dispatch(resetQrData());
  //         }
         
  //       }
  //     }
  //   };

  //   fetchData();
  // }, [qrData, getItemDescription]);


  const handleShowDp = async () => {
    const err = checkInput();
    if (Object.keys(err).length == 0) {
      setModalVisible(true);
      const data = { ItemDescriptionUID: getItemDescription, LocationID: getProductionLocation, QRCode: qrData };
      const encodedFilterData = encodeURIComponent(JSON.stringify(data));
      const response = await getFromAPI(`/get_weft_issue_details?data=${encodedFilterData}`);
      setWIList(response.WeftIssueDetails);
    }
  };

  const toggleSelectItem = useCallback((item) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(item.QRCode)
        ? prevSelectedItems.filter(id => id !== item.QRCode)
        : [...prevSelectedItems, item.QRCode]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length === getWIList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(getWIList.map(item => item.QRCode));
    }
  }, [selectedItems, getWIList]);

  const handleSave = useCallback(() => {
    const newSavedData = getWIList.filter(item => selectedItems.includes(item.QRCode));
    const uniqueNewSavedData = newSavedData.filter(newItem =>
      !savedData.some(existingItem => existingItem.QRCode === newItem.QRCode)
    );

    if (uniqueNewSavedData.length > 0) {
      dispatch(appendSavedData(uniqueNewSavedData));
    } else {
      dispatch(resetSavedData());
      dispatch(appendSavedData(newSavedData));
    }

    setModalVisible(false);
  }, [selectedItems, getWIList, savedData, dispatch]);

  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleDeleteRow = (QRCode) => {
    dispatch(deleteSavedData(QRCode));
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weft Issue List</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleShowDp}>
          <Icon name="add-circle" size={35} color={colors.data} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.button} onPress={()=>navigateToCamera()}>
        <Icon name="qr-code-outline" size={40} color={colors.header} />
        </TouchableOpacity> */}
      </View>

      <ScrollView horizontal>
        <View>
          <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
            <Row data={tableHead} widthArr={widthArr} style={styles.header} textStyle={styles.text} />
          </Table>
          <ScrollView style={styles.dataWrapper}>
            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
              {savedData.map((rowData, index) => (
                <Row
                  key={index}
                  data={[
                    <View>
                      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { handleDeleteRow(rowData.QRCode) }}>
                        <Icon1 name="delete" size={15} color="red" />
                      </TouchableOpacity>
                    </View>,
                    rowData.LotNo,
                    rowData.StockCone.toFixed(2),
                    rowData.ConeWeight.toFixed(2),
                    rowData.StockQty.toFixed(2),
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Text>{rowData.IssueCone}</Text>
                      <TouchableOpacity style={{ marginLeft: 10 }}>
                        <EditIssueCone StockCone={rowData.StockCone} QRCode={rowData.QRCode}
                          ConeWeight={rowData.ConeWeight} />
                      </TouchableOpacity>
                    </View>,
                    rowData.IssueQty.toFixed(2)
                  ]}
                  widthArr={widthArr}
                  style={[styles.row, index % 2 && { backgroundColor: 'white' }]}
                  textStyle={styles.text}
                />
              ))}
            </Table>
          </ScrollView>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.flatListContainer}>
              <View style={styles.headerRow1}>
                <Text style={styles.header1}>SelectRow</Text>
                <Text style={styles.header1}>LotNo</Text>
                <Text style={styles.header1}>StockCone</Text>
                <Text style={styles.header1}>ConeWeight</Text>
              </View>
              <FlatList
                data={getWIList}
                style={{padding:10}}
                keyExtractor={(item) => item.QRCode}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.listItem} onPress={() => toggleSelectItem(item)}>
                    <View style={styles.rowContainer}>
                      <CheckBox
                        checked={selectedItems.includes(item.QRCode)}
                        onPress={() => toggleSelectItem(item)}
                        size={16}
                        containerStyle={{}}
                      />
                      <Text style={styles.item}>{item.LotNo}</Text>
                      <Text style={styles.item}>{item.StockCone}</Text>
                      <Text style={styles.item}>{item.ConeWeight.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={handleCancel} color={colors.error} style={{ fontSize: 10 }} />
              <Button title="Save" onPress={handleSave} color={colors.button} />
            </View>
          </View>
        </View>
      </Modal>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 1, paddingTop: 1, backgroundColor: '#fff', marginBottom: 20 },
  header: { height: 50, backgroundColor: colors.filter },
  text: { textAlign: 'center', fontWeight: '400', fontSize: 10 },
  dataWrapper: { marginTop: -1 },
  row: { height: 40, backgroundColor: 'white' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'gray',
  },
  modalContent: {
    width: 360,
    padding: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
    padding:1
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'gray'
  },
  flatListContainer: {
    maxHeight: 500,
    width: '100%',
  },
  listItem: {
    marginBottom: 5,
    borderBottomWidth: 0.4,
    borderColor: colors.data,
    paddingBottom: 5,
    paddingTop: 5,
    width: '100%',
  },
  headerRow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 0,
    padding:10,
    marginTop:10
  },
  header1: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    color: 'gray'
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 1,
  },
  label: {
    color: colors.data,
    fontSize: 12,
  },
  item: {
    color: 'gray',
    fontSize: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    padding:10
  },
});

export default WeftIssueList;
