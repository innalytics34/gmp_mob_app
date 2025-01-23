import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import { postToAPI, getFromAPI } from '../apicall/apicall';
import { useAuth } from '../auth/AuthContext';
import { colors, toastConfig } from '../component/config/config';
import Dropdown from '../component/dropdown/Dropdown';
import { TextInput as PaperInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameList, setUserNameList] = useState([]);
  const [getAppVersion, setAppVersion] = useState('');
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  const { login, setipconfig } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {

      // const ipconfig = await axios.get('https://demomisapi.azurewebsites.net/gmp/get_gmpapiipconfig', {
      //   headers: {
      //       'accept': 'application/json', 
      //   }
      // });
      // setipconfig(ipconfig.data)
      const [response, response1] = await Promise.all([
        getFromAPI('/get_userlist'),
        getFromAPI('/get_setting'),
      ]);
      setUserNameList(response.userlist);
      setAppVersion(response1.setting[0].AppVersion);
    } catch (error) {
      Alert.alert('Error', 'Failed to load filter data. Logout and Try Again.');
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const checkVersion = () => {
    return getAppVersion === '1.0.5';
  };

  const forcelogoutLogin = async () =>{
    const res = await postToAPI('/put_forcelogout', {username:email});
    if (res.rval > 0 ){
      Toast.show({
        ...toastConfig.success,
        text1: res.message,
      });
      return;
    }
    else{
      Toast.show({
        ...toastConfig.error,
        text1: res.message,
      });
      return;
    }
    

  }

  const handleLogin = async () => {
    setLoading(true);
    const newErrors = {};
    try {
      const isCheckVersion = checkVersion();
      if (isCheckVersion) {
        Toast.show({
          ...toastConfig.error,
          text1: `Use Version  ${getAppVersion}`,
        });
        return;
      }
      if (!email) newErrors.username = 'Username is required';
      if (!password) newErrors.password = 'Password is required';
      const data = { username: email, password: password, version: '1.0.5'};
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setLoading(true);
        const result = await postToAPI('/login', data);
        setLoading(false);
        if (result.rval == 1) {
          const userData = {
            token: result.token,
            is_login: 'true',
            username: result.username,
            user_id: String(result.user_id),
          };
          login(userData);
        }
        else if (result.rval == 2){
          Alert.alert(
            "User Already Logged In with Another Device", 
            `It seems you're already logged in on another device. Please log out from the other device if you wish to continue.`,
            [
              { 
                text: "Cancel", 
                style: "cancel"
              },
              { 
                text: "Logout", 
                onPress: () => forcelogoutLogin(result), 
              },
            ],
            { cancelable: false }  
          );
        }
         else {
          Toast.show({
            ...toastConfig.error,
            text1: result.message,
          });
        }
      }
    } catch (error) {
      Toast.show({
        ...toastConfig.error,
        text1: 'Something went wrong! ' + (error.message || 'Unknown error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (value) => {
    setEmail(value);
    setErrors((prevErrors) => ({ ...prevErrors, username: '' }));
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible); 
  };

  return (
    <>
      <View>
        <Text style={{ padding: 5, fontWeight: 'bold', color: colors.header }}>
          Version 1.0.5
        </Text>
      </View>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.primary }]}>
          GMP WEAVING MILLS PRIVATE LIMITED
        </Text>
        <View style={{ padding: 10 }}>
          <Dropdown
            data={usernameList}
            setSelectdp={handleUserChange}
            label="Username"
            Selectdp={email}
          />
          {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
        </View>

        <View style={{ padding: 13 }}>
          <PaperInput
            label="Password"
            value={password}
            style={[styles.input, { fontSize: 14 }]}
            onChangeText={handlePasswordChange}
            mode="outlined"
            secureTextEntry={!isPasswordVisible} 
            theme={{
              colors: {
                primary: colors.data,
                error: colors.error,
                outline: colors.data,
                disabled: 'red',
              },
              roundness: 4,
            }}
            right={
              <PaperInput.Icon
                name={() => (
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.data}
                    />
                  </TouchableOpacity>
                )}
              />
            }
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <View style={{ padding: 13 }}>
          <Button
            title="Login"
            icon={{
              name: 'sign-in',
              type: 'font-awesome',
              size: 20,
              color: 'white',
            }}
            iconRight
            buttonStyle={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleLogin}
            loading={loading}
            loadingProps={{ size: 'small', color: '#fff' }}
          />
        </View>

        <Toast ref={(ref) => Toast.setRef(ref)} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 35,
  },
  inputContainer: {
    marginVertical: 10,
  },
  input: {
    fontSize: 16,
  },
  loginButton: {
    borderRadius: 5,
    marginVertical: 20,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 10,
  },
});

export default LoginScreen;
