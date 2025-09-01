import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import HobiXHomeScreen from './src/screens/HobiXHomeScreen';

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <HobiXHomeScreen />
    </NavigationContainer>
  );
}

export default App;
