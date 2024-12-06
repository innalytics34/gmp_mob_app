import React from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { DataTable } from 'react-native-paper';
import { colors } from '../../config/config';

const BeamDetails = ({getBeamDetails, doffMeter}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beam Details</Text>
      <DataTable style={styles.table}>
        <DataTable.Header>
          <DataTable.Title>FilledNo</DataTable.Title>
          <DataTable.Title>SizingNo</DataTable.Title>
          <DataTable.Title>Mtr</DataTable.Title>
          <DataTable.Title>BalMtr</DataTable.Title>
          <DataTable.Title>SetNo</DataTable.Title>
        </DataTable.Header>

        <FlatList
          data={getBeamDetails}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DataTable.Row style={styles.row}>
              <DataTable.Cell style={styles.cell}>
                <Text style={styles.cellText}>{item.FilledBeamNumber}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell}>
                <Text style={styles.cellText}>{item.BeamMeter}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell}>
                <Text style={styles.cellText}>{item.SizingBeamNo}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell}>
                <Text style={styles.cellText}>{item.BalanceBeamMeter - doffMeter}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cell}>
                <Text style={styles.cellText}>{item.SetNo}</Text>
              </DataTable.Cell>
            </DataTable.Row>
          )}
        />
      </DataTable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 3,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color:'gray'
  },
  table: {
    borderWidth: 1,
    borderColor: colors.data, 
    borderRadius: 4,
    overflow: 'hidden', 
  },
  header: {
    borderBottomWidth: 0.4,
  },
  row: {
    borderBottomWidth: 0.4,
  },
  cell: {
    paddingVertical: 12, 
    flex: 1, 
    justifyContent: 'left', 
  },
  cellText: {
    flexWrap: 'wrap',
    maxWidth: '100%',
    fontSize:10
  },
});

export default BeamDetails;
