import WifiManager from 'react-native-wifi-reborn';
import { getFromAPI } from '../apicall/apicall';


export const getCurrentWifiSignalStrength = async () => {
  try {
    const strength = await WifiManager.getCurrentSignalStrength();
    if (strength !== null) {
      const res = await getFromAPI('/get_setting')
      console.log(res)
      if (!res && res.setting.length == 0 ){
        return { message: "Please Connect Wifi", rval: 0 };
      }
      if (strength > res.setting[0].WifiMinLimit && strength < res.setting[0].WifiMaxLimit) {
        return { message: "Good Strength", rval: 1 };
      } else if (strength === -127) {
        return { message: "Please Connect Wifi", rval: 0 };
      } else {
        return { message: `Bad signal ${strength} dBm. Range ${res.setting[0].WifiMinLimit} to ${res.setting[0].WifiMaxLimit} is Allowed`, rval: 0 };
      }
    } else {
      return { message: "Unable to get signal strength.", rval: 0 };
    }
  } catch (err) {
    console.error("Error fetching signal strength: ", err);
    return { message: "Error fetching Wi-Fi signal strength.", rval: 0 };
  }
};



export const CurrentWifiSignalStrength = async () => {
  try {
    const strength = await WifiManager.getCurrentSignalStrength();
    if (strength !== null) {
        return strength
    } else {
      return 0
    }
  } catch (err) {
    console.error("Error fetching signal strength: ", err);
    return 0
  }
};
