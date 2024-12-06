import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import Login from '../screen/Login';
import AddDoff from '../component/production/doff/AddDoff';
import BeamKnotting from '../component/production/doff/BeamKnotting';
import SingleBeamKnotting from '../component/production/doff/SingleBeamKnotting';
import LastRollSortChange from '../component/production/doff/LastRollSortChange';
import SortChangeLR3 from '../component/production/doff/ShortChangeLR3';
import ScBc from '../component/production/doff/ScBc';
import WeftIssue from '../component/production/weftissue/WeftIssueInfo';
import CameraScreen from '../component/barcodescan/CameraScreen';
import WeftReturn from '../component/production/weftreturn/WeftRetrunInfo';
import WeftWastage from '../component/production/weftwastage/WeftWastageInfo';


const Stack = createStackNavigator();

const AppNav = ({ initialRoute }) => {

  return (
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen
        name="Admin"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="DoffInfo"
        component={AddDoff}
        options={{ headerShown: true,  headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="BeamKnotting"
        component={BeamKnotting}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="SingleBeamKnotting"
        component={SingleBeamKnotting}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="LastRollSortChange"
        component={LastRollSortChange}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="SortChangeLR3"
        component={SortChangeLR3}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="ScBc"
        component={ScBc}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="WeftIssue"
        component={WeftIssue}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="WeftReturn"
        component={WeftReturn}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="WeftWastage"
        component={WeftWastage}
        options={{ headerShown: true, headerTintColor: 'white' }}
      />

      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: false }} // Full screen
      />
    </Stack.Navigator>

  );
};

export default AppNav;
