import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import CreateTicketScreen from './screens/CreateTicketScreen';
import QueuePositionScreen from './screens/QueuePositionScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#4ECDC4',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#e0e0e0',
          },
          headerStyle: {
            backgroundColor: '#fff',
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Create"
          component={CreateTicketScreen}
          options={{
            title: 'Create Ticket',
            tabBarLabel: 'Create',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>➕</Text>,
          }}
        />
        <Tab.Screen
          name="QueuePosition"
          component={QueuePositionScreen}
          options={{
            title: 'Queue Position',
            tabBarLabel: 'Status',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📊</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
