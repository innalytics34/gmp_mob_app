import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform ,
  Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors as colorss } from '../../component/config/config';
import { Menu, IconButton } from 'react-native-paper'; 
import { useAuth } from '../../auth/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { resetQrData } from '../barcodescan/QrSlice.tsx';
import { resetSavedData } from './weftissue/savedDataSlice'; 
import TestPrinter from '../bluetoothPrinter/BluetoothPrinter';
import { postToAPI } from '../../apicall/apicall';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(false);
  

  const handleLogout = async() => {
    try{
      await postToAPI('/put_logout', {});
      setMenuVisible(false);
      logout();
      navigation.navigate('Login');
    }
    catch{
      setMenuVisible(false);
      navigation.navigate('Login');
    }
   
  };

  const requestNearbyDevicePermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;

         if (androidVersion >= 31) {
            const granted = await PermissionsAndroid.requestMultiple([
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
              PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ]);

          if (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('All permissions granted');
          } else {
            Alert.alert('Permission Denied', 'Some permissions were denied');
          }
        } else {
          const locationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );

          if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Location permission granted');
          } else {
            Alert.alert('Permission Denied', 'Location permission is required');
          }
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    requestNearbyDevicePermissions();
  }, []);


  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: colorss.textLight, fontWeight: 'bold', fontSize: 16 }}>GMP</Text>
      ),
      headerStyle: { backgroundColor: colorss.header },
      headerRight: () => (
        <View style={styles.headerRight}>
          <Text style={{ color: colorss.textLight, fontWeight: 'bold' }}>{user.username}</Text>
          <Menu
            visible={menuVisible}
            style={{ marginTop: 80, backgroundColor: colorss.textLight }}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                iconColor={colorss.textLight}
                icon="account-circle"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={handleLogout} title="Logout" />
          </Menu>
        </View>
      ),
    });
  }, [navigation, menuVisible, user]);
  

  const doffInfo = () => {
    dispatch(resetQrData());
    navigation.navigate('DoffInfo');
  };

  const wefftIssueInfo = () => {
    dispatch(resetQrData());
    dispatch(resetSavedData());
    navigation.navigate('WeftIssue');
  };
  const wefftReturnInfo = () =>{
    dispatch(resetQrData());
    dispatch(resetSavedData());
    navigation.navigate('WeftReturn');
  }

  const wefftWastageInfo = () =>{
    dispatch(resetQrData());
    dispatch(resetSavedData());
    navigation.navigate('WeftWastage');
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.touchable} onPress={doffInfo}>
          <LinearGradient
            colors={['#d0fbe1', '#f4fff8']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.title}>Doff</Text>
            <Icon name="cut-outline" size={25} color={colorss.header}/>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchable} onPress={wefftIssueInfo}>
          <LinearGradient
            colors={['#d0fbe1', '#f4fff8']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.title}>Weft Issue</Text>
            <Icon name="bulb-outline" size={25} color={colorss.header}/>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <View style={styles.rowContainer}>
        <TouchableOpacity style={styles.touchable} onPress={wefftReturnInfo}>
          <LinearGradient
            colors={['#d0fbe1', '#f4fff8']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.title}>Weft Return</Text>
            <Icon name="trending-up-sharp" size={25} color={colorss.header}/>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchable} onPress={wefftWastageInfo}>
          <LinearGradient
            colors={['#d0fbe1', '#f4fff8']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.title}>Weft Wastage</Text>
            <Icon name="trash-outline" size={25} color={colorss.header}/>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <TestPrinter/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  rowContainer: {
    flexDirection: 'row',      
    justifyContent: 'space-between', 
  },
  touchable: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 5,      
    borderRadius: 10,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  title: {
    color: colorss.header ,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HomeScreen;
