import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    warpDetails: []
};

const warpDetailsSlice = createSlice({
    name: 'warpDetails',
    initialState,
    reducers: {
        setWarpDetails: (state, action) => {
            state.warpDetails = action.payload;
        },
        updateWarpDetail: (state, action) => {
            const { index, newDetail } = action.payload;
            state.warpDetails[index] = { ...state.warpDetails[index], ...newDetail };
        },
    },
});

export const { setWarpDetails, updateWarpDetail } = warpDetailsSlice.actions;

export default warpDetailsSlice.reducer;
