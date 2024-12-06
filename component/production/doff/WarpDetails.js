import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, Modal, TouchableOpacity } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, toastConfig } from '../../config/config';
import { updateWarpDetail, setWarpDetails } from './warpSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getFromAPI } from '../../../apicall/apicall';
import { useNavigation } from '@react-navigation/native';
import {setwarpInfo} from '../doff/commonSlice';
import {resetQrData} from '../../barcodescan/QrSlice';
import Toast from 'react-native-toast-message';




const WarpDetails = ({ loom_detail }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const qrData = useSelector(state => state.QRData.data);
    const [WarpBeamTypeOptions, setWarpBeamTypeOptions] = useState([]);
    const warpDetails = useSelector(state => state.warpDetails.warpDetails);
    const [showsetScan, setShowsetScan] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            dispatch(setWarpDetails(warpDetails));
        };
        fetchData();
    }, [dispatch]);


    useEffect(() => {
        const fetchData = async () => {
            if (qrData !=  null){
                setShowsetScan(true);
            }      
        };
        fetchData();
    }, [qrData]);




    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedRow, setSelectedRow] = React.useState(null);

    const setSelectedType = (selectedType, index) => {
        const newData = [...warpDetails];
        newData[index] = {
            ...newData[index],
            BeamNo: selectedType.BeamNo,
            EmptyBeamNo: selectedType.EmptyBeamNo,
            SetNo: selectedType.SetNo,
            BeamMeter: selectedType.BeamMeter,
            WarpedYarn: selectedType.WarpedYarn,
            selectedType
        };
        dispatch(updateWarpDetail({ index, newDetail: newData[index] }));
        setModalVisible(false);
        setSelectedRow(null);
    };

    const handlePressAddIcon = async (item, index) => {

        const data = {
            Ends: item.Ends, YarnMaterial_UID: item.YarnMaterial_UID,
            WorkOrderID: loom_detail.WorkOrderID, Description: loom_detail.Description
        }
        const encodedFilterData = encodeURIComponent(JSON.stringify(data));
        const response = await getFromAPI('get_select_filled_beam?data=' + encodedFilterData);
        console.log(response, "--------------trd")
        setWarpBeamTypeOptions(response.SelectFilledBeam)
        setModalVisible(true);
        setSelectedRow(index);
    }

    
    const navigateToCamera = async(item, index) => {
        setSelectedRow(index);
        dispatch(resetQrData());
        const data = {
            Ends: item.Ends, YarnMaterial_UID: item.YarnMaterial_UID,
            WorkOrderID: loom_detail.WorkOrderID, Description: loom_detail.Description
        }
        const encodedFilterData = encodeURIComponent(JSON.stringify(data));
        const response = await getFromAPI('get_select_filled_beam?data=' + encodedFilterData);
        const items = {filled_beam: response.SelectFilledBeam}
        dispatch(setwarpInfo(items));
        navigation.navigate('Camera', {page : 'BeamKnotting'});
    }

    const handleLoadScanData = async(item, index)=>{
        const data = {
            Ends: item.Ends, YarnMaterial_UID: item.YarnMaterial_UID,
            WorkOrderID: loom_detail.WorkOrderID, Description: loom_detail.Description
        }
        const encodedFilterData = encodeURIComponent(JSON.stringify(data));
        const response = await getFromAPI('get_select_filled_beam?data=' + encodedFilterData);
        const qrcode_det = response.SelectFilledBeam.filter(item => item.BatchId == qrData);
        if (qrcode_det.length > 0){
            setSelectedType(qrcode_det[0], index);
            setShowsetScan(false);
        }
        else{
            Toast.show({
                ...toastConfig.error,
                text1: 'Please Scan Valid QR',
              });
              setShowsetScan(false);
        }
    }

    const renderMenu = () => (
        <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.closeButton}
                    >
                        <Icon name="close" size={18} color="red" />
                    </TouchableOpacity>
             <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        {WarpBeamTypeOptions.length > 0 ? (
                            WarpBeamTypeOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedType(option, selectedRow)}
                                    style={styles.modalItem}
                                >
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: '#f1fbed' }}>
                                        <Text style={styles.item}>BeamNo: {option.BeamNo}</Text>
                                        <Text style={styles.item}>BeamMeter: {option.BeamMeter}</Text>
                                        <Text style={styles.item}>SetNo: {option.SetNo}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No data found</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const dataToDisplay = warpDetails.map((item, index) => [
        item.WarpBeamTypeDescription,
        item.YarnMaterialUIDDescription,
        item.Ends,
        <TouchableOpacity onPress={() => handlePressAddIcon(item, index)} style={{ padding: 2 }}>
            <Icon name="add" size={33} style={styles.icon} />
        </TouchableOpacity>,
        <View>
            {showsetScan ? 
              <TouchableOpacity onPress={() => handleLoadScanData(item, index)} style={{ padding: 2 }}>
                 <Icon name="arrow-redo-circle" size={35} color={colors.header}/>,
              </TouchableOpacity>
             : 
            <TouchableOpacity onPress={() => navigateToCamera(item, index)} style={{ padding: 2 }}>
                <Icon name="qr-code-outline" size={35} color={colors.header}/>,
            </TouchableOpacity>
            }
        </View>
        ,
        
        item.BeamNo,
        item.SetNo,
        item.BeamMeter,
    ]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Warp Details</Text>
            <ScrollView horizontal={true}>
                <View>
                    <Table borderStyle={{ borderWidth: 1, borderColor: colors.data }}>
                        <Row data={['Beam Type', 'Yarn Material', 'End', '', '', 'Beam No', 'Set No', 'Beam Meter']} widthArr={[100, 200, 80, 40,40, 80, 150, 80]} style={styles.header} textStyle={styles.text} />
                    </Table>
                    <ScrollView style={styles.dataWrapper}>
                        <Table borderStyle={{ borderWidth: 1, borderColor: colors.data }}>
                            {
                                dataToDisplay.map((rowData, index) => (
                                    <Row
                                        key={index}
                                        data={rowData}
                                        widthArr={[100, 200, 80, 40,40, 80, 150, 80]}
                                        style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]}
                                        textStyle={styles.text}
                                    />
                                ))
                            }
                        </Table>
                    </ScrollView>
                </View>
            </ScrollView>
            {renderMenu()}
            <Toast ref={(ref3) => Toast.setRef(ref3)} />
        </View>
    );
};

const styles = StyleSheet.create({
    // Your styles here
    container: {
        flex: 1,
        padding: 5,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'gray'
    },
    header: {
        height: 50,
        backgroundColor: colors.filter,
    },
    dataWrapper: {
        marginTop: -1,
    },
    row: {
        height: 40,
    },
    text: {
        textAlign: 'center',
        fontSize: 10
    },
    icon: {
        color: colors.textLight,
        backgroundColor: '#71986f',
        borderRadius: 5,
        margin: 1
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
        height: 600
    },
    menuItem: {
        padding: 10,
    },
    modalItem: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        marginVertical: 5,
        borderRadius: 5,
    },
    closeButton: {
        marginTop: 2,
    },
    item: {
        fontSize: 10
    },
    noDataText: {
        fontSize: 18,
        color: '#888',
      },
      noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
});

export default WarpDetails;