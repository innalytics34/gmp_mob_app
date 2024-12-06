import React from 'react';
import { View, StyleSheet } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const Loader = ({ visible }) => (
  <Spinner
    visible={visible}
    textContent={''}
    textStyle={styles.spinnerTextStyle}
  />
);

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: 'green',
  },
});

export default Loader;
