import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import TasasScreen from './src/screens/TasasScreen';
import OficinasScreen from './src/screens/OficinasScreen';
import AgendarScreen from './src/screens/AgendarScreen';
import ConsultarScreen from './src/screens/ConsultarScreen';
import CitaConfirmadaScreen from './src/screens/CitaConfirmadaScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  primary: '#D4AF37',
  secondary: '#1a1a2e',
  accent: '#16213e',
  white: '#ffffff',
  background: '#f5f5f5',
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasas') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Oficinas') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Agendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Consultar') {
            iconName = focused ? 'search' : 'search-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: COLORS.secondary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ title: 'Guantes de Oro' }}
      />
      <Tab.Screen
        name="Tasas"
        component={TasasScreen}
        options={{ title: 'Tasas de Cambio' }}
      />
      <Tab.Screen
        name="Oficinas"
        component={OficinasScreen}
        options={{ title: 'Nuestras Oficinas' }}
      />
      <Tab.Screen
        name="Agendar"
        component={AgendarScreen}
        options={{ title: 'Agendar Cita' }}
      />
      <Tab.Screen
        name="Consultar"
        component={ConsultarScreen}
        options={{ title: 'Consultar Cita' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CitaConfirmada"
          component={CitaConfirmadaScreen}
          options={{
            title: 'Cita Confirmada',
            headerStyle: { backgroundColor: COLORS.secondary },
            headerTintColor: COLORS.white,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
