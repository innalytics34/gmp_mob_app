import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { colors } from '../config/config';

const DropdownComponent = ({ data, setSelectdp, label, Selectdp, isDisable }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(Selectdp); // Initialize with the selected value directly

  useEffect(() => {
    setValue(Selectdp); // Update local state when Selectdp changes
  }, [Selectdp]);

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: colors.data }]}>
          {label}
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: colors.data, borderWidth: 2 }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        disable={isDisable}
        search
        maxHeight={400}
        labelField="label"
        valueField="value" // Use "value" to set the selected item's value
        placeholder={!isFocus ? `Select ${label}` : '...'}
        searchPlaceholder="Search..."
        value={value} // Ensure the value reflects the selected item's label
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.label); // Set the selected label
          setSelectdp(item.value); 
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? colors.data : 'black'}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 3,
    marginTop:10
  },
  dropdown: {
    height: 50,
    borderColor: colors.data,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: -9,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  placeholderStyle: {
    fontSize: 12,
  },
  selectedTextStyle: {
    fontSize: 12,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 12,
  },
});
