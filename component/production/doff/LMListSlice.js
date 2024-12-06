// LMListSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tableData: [], // Initial state for the loom mapping list
};

const LMListSlice = createSlice({
  name: 'LMList',
  initialState,
  reducers: {
    addRow: (state, action) => {
      state.tableData.push(action.payload); // Add a new row to the table
    },
    deleteRow: (state) => {
      state.tableData.pop(); // Remove the last row from the table
    },
    updateRow: (state, action) => {
      const { index, updatedRow } = action.payload;
      if (index >= 0 && index < state.tableData.length) {
        state.tableData[index] = {
          ...state.tableData[index],
          ...updatedRow, // Update the row with new data
        };
      }
    },
    resetTableData: (state) => {
      state.tableData = []; // Reset the table data to its initial state
    },
  },
});

// Export actions
export const { addRow, deleteRow, updateRow, resetTableData } = LMListSlice.actions;

// Export reducer
export default LMListSlice.reducer;
