import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './auth/AuthContext';
import AppNav from './navigation/AppNavigator'
import Login from './screen/Login';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store/store';
import { Provider as PaperProvider } from 'react-native-paper';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './auth/AuthContext';
import { StatusBar } from 'react-native';


const AppContent = () => {
  const { user, loading } = useAuth();
  // const initialRoute = user?.priv_id === 1
  //   ? 'Admin'
  //   : user?.priv_id === 2
  //   ? 'Caption'
  //   : user?.priv_id === 3
  //   ? 'Kitchen'
  //   : 'Login';
  const initialRoute = 'Admin'

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (<>
  <StatusBar backgroundColor="#2b6c45" barStyle="light-content" />
    <NavigationContainer>
      {user ? <AppNav initialRoute={initialRoute}/> : <Login />}
    </NavigationContainer>
    </>);
};


const App = () => {
  return (
    <AuthProvider>
      <ReduxProvider store={store}>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
      </ReduxProvider>
    </AuthProvider>
  );
};

export default App;
