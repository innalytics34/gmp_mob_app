import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QrState {
  data: string | null;
  
}

const initialState: QrState = {
  data: null,
};

const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {
    setQrData(state, action: PayloadAction<string | null>) {
      state.data = action.payload;
    },
    resetQrData(state) {
      state.data = initialState.data; 
    },
  },
});

export const { setQrData, resetQrData } = qrSlice.actions;
export default qrSlice.reducer;
