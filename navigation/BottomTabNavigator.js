import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Home from '../component/home/Home';
import Production from '../component/production/Production';
import { colors } from '../component/config/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Production':
              iconName = 'clipboard-list';
              break;
            default:
              iconName = 'circle';
              break;
          }
          return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: colors.icon,
        tabBarInactiveTintColor: colors.data,
        tabBarStyle: {
          backgroundColor: 'white',
          paddingBottom: 10,
          paddingTop: 3,
          height: 55,
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarLabelStyle: { fontSize: 8 },
      })}
    >
      {/* <Tab.Screen name="Home" component={Home} /> */}
      <Tab.Screen name="Production" component={Production}
        options={{
          title: 'Production',
          headerTitleStyle: { color: colors.textLight, fontSize: 17 },
          headerStyle: {
            backgroundColor: colors.header, 
          },
        }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});

export default BottomTabNavigator;
