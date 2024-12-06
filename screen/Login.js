import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Input, Icon } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import { postToAPI, getFromAPI } from '../apicall/apicall';
import { useAuth } from '../auth/AuthContext';
import { colors, toastConfig } from '../component/config/config';
import Dropdown from '../component/dropdown/Dropdown';
import { TextInput as PaperInput} from 'react-native-paper';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameList, setUserNameList] = useState([]);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();


  const fetchData = async () => {
    setLoading(true);
    try {
      const [response] = await Promise.all([
        getFromAPI('/get_userlist')
      ]);
      setUserNameList(response.userlist);
    } catch (error) {
      Alert.alert('Error', 'Failed to load filter data.');
      console.error('Error fetching filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchData()
  }, [])

  const handleLogin = async () => {
    setLoading(true);
    const newErrors = {};
    try {
      if (!email) newErrors.username = 'Username is required';
      if (!password) newErrors.password = 'Password is required';
      const data = { username: email, password: password };
      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setLoading(true);
        const result = await postToAPI("/login", data);
        setLoading(false);
        if (result.rval > 0) {
          const userData = {
            token: result.token,
            is_login: 'true',
            username: result.username,
            user_id: String(result.user_id),
          };
          login(userData);
        } else {
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

  const handleUserChange = (value)=>{
    setEmail(value);
    setErrors((prevErrors) => ({ ...prevErrors, username: '' }));
  }

  const handlePasswordChange =(value)=>{
    setPassword(value);
    setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>GMP WEAVING MILLS PRIVATE LIMITED</Text>

      <View style={{padding:10}}>
          <Dropdown
            data={usernameList}
            setSelectdp={handleUserChange}
            label="Username"
            Selectdp={email}
          />
       {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
      </View>
      
      <View style={{padding:13}}>
      <PaperInput
        label="Password"
        value={password}
        style={[styles.input, { fontSize: 14 }]}
        onChangeText={handlePasswordChange}
        mode="outlined"
        theme={{
          colors: {
            primary: colors.data,
            error: colors.error,
            outline: colors.data,
            disabled: 'red',
          },
          roundness: 4,
        }}
      />
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
      </View>

      <View style={{padding:13}}>
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
    fontSize: 10
  },
});

export default LoginScreen;
