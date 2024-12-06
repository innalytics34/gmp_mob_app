import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const QrOverlay: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Text style={styles.instructionText}>Align the QR code inside the box</Text>
        <View style={styles.transparentRectangle} />
      </View>
      <View style={styles.backgroundOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: '80%',
    height: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  transparentRectangle: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 4,
    borderColor: 'white',
    position: 'absolute',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  instructionText: {
    position: 'absolute',
    bottom: 20,
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 20,
  },
});

export default QrOverlay;
