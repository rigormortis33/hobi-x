import { StatusBar } from 'expo-status-bar';
import SimpleHomeScreen from './src/screens/SimpleHomeScreen';

export default function App() {
  return (
    <>
      <SimpleHomeScreen />
      <StatusBar style="auto" />
    </>
  );
}
