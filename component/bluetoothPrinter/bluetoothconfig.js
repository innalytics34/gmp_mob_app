import { BleManager } from 'react-native-ble-plx';


const handleBluetoothState = async (bleManager) => {
    const currentState = await bleManager.state();
    return currentState;
};

export const bluetoothconfig = async (bluetooth_conf, setLoading) => {
    const bleManager = new BleManager();

    try {
        const blueStat = await handleBluetoothState(bleManager);
        
        if (blueStat !== 'PoweredOn') {
            return { 'message': 'Bluetooth is not powered on', val: 0 };
        }
        setLoading(true);  
        const timeoutDuration = 4000; 
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timed out')), timeoutDuration)
        );

        const connectionPromise = bleManager.connectToDevice(bluetooth_conf.device_id)
            .then(async (connectedDevice) => {
                await connectedDevice.discoverAllServicesAndCharacteristics();
                bleManager.destroy(); 
                return { 'message': `Device ${bluetooth_conf.device_id} connected successfully`, val: 1 };
            });

        const result = await Promise.race([connectionPromise, timeout]);
        setLoading(false);
        return result;

    } catch (error) {
        bleManager.destroy(); 
        setLoading(false);
        return { 'message': `Failed to connect ${bluetooth_conf.device_name}`, val: 0 };
    }
};
