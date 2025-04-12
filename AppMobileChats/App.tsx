import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import HomeView from './src/Views/Home';
import { StyledView } from './src/shared/styled';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigations/Navigation';

export default function App() {
  return (
    <SafeAreaProvider>
        <StyledView className='w-full h-full bg-[#F45B5B]'>
          <NavigationContainer>
              <Navigation />
          </NavigationContainer>
        </StyledView>
    </SafeAreaProvider>
  );
}

