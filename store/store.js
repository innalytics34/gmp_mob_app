import { configureStore } from '@reduxjs/toolkit';
import  warpDetailsReducer from '../component/production/doff/warpSlice';
import LMListReducer from '../component/production/doff/LMListSlice';
import QRReducer from '../component/barcodescan/QrSlice';
import savedDataReducer from '../component/production/weftissue/savedDataSlice';
import savedDataReducerReturn from '../component/production/weftreturn/savedDataSlice';
import savedDataReducerWastage from '../component/production/weftwastage/savedDataSlice';
import doffCommonReducer from '../component/production/doff/commonSlice';

export const store = configureStore({
  reducer: {
    warpDetails: warpDetailsReducer,
    LMList: LMListReducer,
    QRData: QRReducer,
    savedData: savedDataReducer,
    savedDataReturn : savedDataReducerReturn,
    savedDataWastage: savedDataReducerWastage,
    doffCommon: doffCommonReducer
  },
});