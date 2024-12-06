import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Table, Row } from 'react-native-table-component';
import { colors } from '../../config/config'; 
import { getFromAPI } from '../../../apicall/apicall';
import { useSelector, useDispatch } from 'react-redux';
import { addRow, deleteRow, updateRow, resetTableData } from './LMListSlice'; 

const LoomMappingList = ({ getSortNo, loom_detail }) => {
  const tableHead = ['Loom No', 'Status'];
  const tableData = useSelector(state => state.LMList.tableData); 
  const dispatch = useDispatch(); 
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [getLMDp, setLMDp] = useState([]);
  
  const handleShowDp = async (index) => {
    const response = await getFromAPI('/get_LoomMappingList');
    setCurrentRowIndex(index);
    setModalVisible(true);
    setLMDp(response.LoomMappingList);
  };

  const handleSelect = (loom_no, sort_no, item) => {
    const updatedRow = {
      loom_uid: item.MachineID,
      MachineNo: item.MachineNo,
    };
    dispatch(updateRow({ index: currentRowIndex, updatedRow })); 
    setModalVisible(false);
  };

  const handleAdd = () => {
    const newRow = {
      loom_uid: loom_detail.MachineID, 
      MachineNo: loom_detail.Description, 
    };
    dispatch(addRow(newRow)); 
  };

  useEffect(()=>{
    dispatch(resetTableData());
    const newRow = {
      loom_uid: loom_detail.MachineID, 
      MachineNo: loom_detail.Description, 
    };
    dispatch(addRow(newRow)); 
  }, []);

  const handleDelete = () => {
    dispatch(deleteRow()); 
  };

  // const renderRowActions = (index) => (
  //   <TouchableOpacity style={styles.button} onPress={() => handleShowDp(index)}>
  //     <Icon name="add-circle" size={20} color={colors.data} />
  //   </TouchableOpacity>
  // );

  const renderMenu = () => (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Icon name="close" size={18} color="red" />
          </TouchableOpacity>
          <ScrollView>
            {getLMDp.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => handleSelect(item.Loom_No, getSortNo, item)} style={styles.modalItem}>
                <Text>Description: {item.Description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loom Mapping List</Text>
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Icon name="add-circle" size={25} color={colors.data}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Icon name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View> */}
      <Table borderStyle={styles.tableBorder}>
        <Row data={tableHead} style={styles.header} textStyle={styles.headerText} />
        {tableData.map((rowData, index) => (
          <Row
            key={index}
            // data={[rowData.MachineNo, 'Machine Mapped', renderRowActions(index)]}
            data={[rowData.MachineNo, 'Machine Mapped']}
            style={styles.row}
            textStyle={styles.text}
          />
        ))}
      </Table>
      {renderMenu()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: colors.data,
  },
  header: {
    height: 40,
    backgroundColor: '#f1f8ff',
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
    color:'#259c4f'
  },
  row: {
    height: 34,
    borderBottomWidth: 1,
    borderColor: colors.data,
  },
  text: {
    textAlign: 'center',
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
  },
  modalItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
    borderRadius: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
});

export default LoomMappingList;
