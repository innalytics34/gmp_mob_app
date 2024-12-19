import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  doffinfo: [],
  doffinfowithLRSC: [],
  warpSelectedInfo: [{ index: 0, selectedType: {} }, { index: 1, selectedType: {} }],
};

const doffinfosSlice = createSlice({
  name: 'doffinfos',
  initialState,
  reducers: {
    setdoffinfo: (state, action) => {
      state.doffinfo = action.payload;
    },
    setdoffinfowithLRSC: (state, action) => {
      state.doffinfowithLRSC = action.payload;
    },
    setwarpInfo: (state, action) => {
      state.warpSelectedInfo = action.payload;
    },
    updateSelectedType: (state, action) => {
      const { index, selectedType } = action.payload;
      const existingEntry = state.warpSelectedInfo.find(entry => entry.index === index);

      if (existingEntry) {
        existingEntry.selectedType = selectedType;
      }
    },
  },
});

// Export the actions
export const { setdoffinfo, setdoffinfowithLRSC, setwarpInfo, updateSelectedType } = doffinfosSlice.actions;

// Export the reducer
export default doffinfosSlice.reducer;
