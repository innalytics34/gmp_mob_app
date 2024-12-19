import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_BASE_URL = "http://192.168.50.55:813/GMPMob";

const getipconfig = (ipconfig)=>{
  if (JSON.parse(ipconfig)){
    if (JSON.parse(ipconfig).ip_config.length > 0){
      return `http://${JSON.parse(ipconfig).ip_config[0].ip}:813/GMPMob`
    }
    else{
      return API_BASE_URL
    }
  }
  else{
    return API_BASE_URL
  }
}
const createAxiosInstance = async () => {
  let token = '';
  const user_details = await AsyncStorage.getItem('user') || '';
  const ipconfig = await AsyncStorage.getItem('ipconfig') || '';
  if (user_details){
    token = JSON.parse(user_details).token;
  }
  return axios.create({
    baseURL: getipconfig(ipconfig) ,
    headers: {
      "Content-Type": "application/json",
       Authorization: `Bearer ${token.replace(/"/g, '')}`,
      "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    },
  });
};

export const getTemplate = async (endpoint) => {
  const axiosInstance = await createAxiosInstance();
  try {
    const response = await axiosInstance.get(endpoint, { responseType: 'blob' });
    return response;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFromAPI = async (endpoint) => {
  const axiosInstance = await createAxiosInstance();
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const postToAPI = async (endpoint, data) => {
  const axiosInstance = await createAxiosInstance();
  try {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
