import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const savedDataSlice = createSlice({
  name: 'savedData',
  initialState,
  reducers: {
    // Append new items to the existing saved data if QRCode is not already present
    appendSavedData(state, action) {
      // Filter out items that are already present in the list based on QRCode
      const newItems = action.payload.filter(item => 
        !state.items.some(existingItem => existingItem.QRCode === item.QRCode)
      );
      // Push the filtered new items into the state
      state.items.push(...newItems);
    },
    // Update an existing item in the saved data
    updateSavedData(state, action) {
      const { id, updatedItem } = action.payload; // Expecting an object with id and updatedItem
      const index = state.items.findIndex(item => item.QRCode === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updatedItem }; // Merge updates
      }
    },
    // Delete an item from the saved data
    deleteSavedData(state, action) {
      const id = action.payload; // Expecting the QRCode to delete
      state.items = state.items.filter(item => item.QRCode !== id);
    },
    // Reset saved data
    resetSavedData(state) {
      state.items = [];
    },
  },
});

export const { appendSavedData, updateSavedData, deleteSavedData, resetSavedData } = savedDataSlice.actions;
export default savedDataSlice.reducer;
