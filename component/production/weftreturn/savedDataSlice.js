import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const savedDataSlice = createSlice({
  name: 'savedData',
  initialState,
  reducers: {
    // Append new items to the existing saved data
    appendSavedData(state, action) {
      state.items.push(...action.payload); // Use spread operator to append
    },
    // Update an existing item in the saved data
    updateSavedData(state, action) {
      const { id, updatedItem } = action.payload; // Expecting an object with id and updatedItem
      const index = state.items.findIndex(item => item.StockID === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedItem }; // Merge updates
      }
    },
    updateSavedDataAll(state, action) {
      // Loop through all items and set specific properties to 0
      state.items = state.items.map(item => ({
        ...item,
        IssueCone: 0,
        IssueQty: 0,
        ReturnWeight: 0,
        ReturnConeWeight: 0,
      }));
    },
    // Delete an item from the saved data
    deleteSavedData(state, action) {
      const id = action.payload; // Expecting the QRCode to delete
      state.items = state.items.filter(item => item.StockID !== id);
    },
    // Reset saved data
    resetSavedData(state) {
      state.items = [];
    },
  },
});

export const { appendSavedData, updateSavedData, deleteSavedData, resetSavedData, updateSavedDataAll } = savedDataSlice.actions;
export default savedDataSlice.reducer;
