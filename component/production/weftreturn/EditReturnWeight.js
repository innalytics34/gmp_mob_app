import React, { useState } from 'react';
import { Modal, View, StyleSheet, Button, Text } from 'react-native';
import { TextInput as PaperInput } from 'react-native-paper';
import Icon1 from 'react-native-vector-icons/AntDesign';
import { colors } from '../../config/config';
import { updateSavedData } from './savedDataSlice';
import { useDispatch } from 'react-redux';

const UpdateReturnWeight = ({ IssueCone, StockID, StockQty }) => {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [ReturnWeight, setReturnWeight] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setErrorMessage(''); 
  };

  const handleSubmit = () => {
    const StockQty1 = parseFloat(StockQty);
    const ReturnWeightValue = parseFloat(ReturnWeight);
    console.log(ReturnWeightValue, StockQty1)
    if (isNaN(ReturnWeightValue) || ReturnWeightValue > StockQty1) {
      setErrorMessage(`ReturnWeight must be less than or equal to StockQty(${StockQty1})`);
      return;
    }
    dispatch(updateSavedData({ 
        id: StockID, 
        updatedItem: { 
          ReturnWeight: ReturnWeight, 
          ReturnConeWeight: ReturnWeightValue / IssueCone
          
        } 
      }));
    handleCloseModal();
  };

  return (
    <>
      <Icon1 name="edit" size={15} color="red" onPress={handleOpenModal} />
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <PaperInput
              label="StockQty"
              value={String(StockQty)}
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
            <PaperInput
              label="ReturnWeight"
              value={ReturnWeight}
              onChangeText={setReturnWeight}
              style={[styles.input, { fontSize: 14 }]}
              mode="outlined"
              keyboardType="numeric"
              theme={{
                colors: {
                  primary: colors.data,
                  error: colors.error,
                  outline: colors.data,
                },
                roundness: 4,
              }}
            />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : <Text style={styles.errorText1}>{'ReturnCone must be less than or equal to StockCone'}</Text>}
            <View style={styles.row}>
              <Button title="Close" color={colors.error} onPress={handleCloseModal} />
              <Button title="Submit" color={colors.data} onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  errorText1: {
    color: 'gray',
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    marginBottom: 20,
  },
});

export default UpdateReturnWeight;
