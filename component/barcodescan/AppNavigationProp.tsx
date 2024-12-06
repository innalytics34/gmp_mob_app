import { CompositeNavigationProp, NavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootParamList = {
  Home: undefined;
  WeftIssue: undefined; 
  AddDoff: undefined;
  BeamKnotting: undefined;
};

export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootParamList>,
  NavigationProp<RootParamList>
>;