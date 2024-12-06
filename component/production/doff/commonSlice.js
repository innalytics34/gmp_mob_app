// commonSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  doffinfo: [],
  doffinfowithLRSC: [],
  warpSelectedInfo: []
};

// First slice for doffinfo
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
  },
});

// Export the actions
export const { setdoffinfo, setdoffinfowithLRSC, setwarpInfo } = doffinfosSlice.actions;

// Export the reducer
export default doffinfosSlice.reducer;
