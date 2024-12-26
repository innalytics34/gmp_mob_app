import WifiManager from 'react-native-wifi-reborn';

// Function to get current Wi-Fi signal strength
export const getCurrentWifiSignalStrength = async () => {
  try {
    // Get the signal strength (in dBm)
    const strength = await WifiManager.getCurrentSignalStrength();
    // const strength = -49;
    // Check if strength is valid
    if (strength !== null) {
      // Handle different signal strength levels
      if (strength > -60 && strength < -30) {
        // Signal strength is good (between -30 dBm and -80 dBm)
        return { message: "Good Strength", rval: 1 };
      } else if (strength === -127) {
        // Signal strength is -127 dBm, which means no connection
        return { message: "Please Connect Wifi", rval: 0 };
      } else {
        // Signal strength is poor
        return { message: "Bad signal", rval: 0 };
      }
    } else {
      // Unable to get the signal strength
      return { message: "Unable to get signal strength.", rval: 0 };
    }
  } catch (err) {
    console.error("Error fetching signal strength: ", err);
    return { message: "Error fetching Wi-Fi signal strength.", rval: 0 };
  }
};
