import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import ExploreScreen from '../screens/ExploreScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminModerationScreen from '../screens/AdminModerationScreen';

// Import auth context
import { useAuth } from '../contexts/AuthContext';
import { HomeTabsParamList, RootStackParamList } from './types';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabsParamList>();

const HomeTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'explore' : 'explore';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help';
          }
          
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff4757',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          headerShown: false,
          title: 'Accueil',
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen} 
        options={{ 
          headerShown: false,
          title: 'Explorer',
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateEventScreen} 
        options={{ 
          headerShown: false,
          title: 'Créer',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          headerShown: false,
          title: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff4757" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen 
              name="HomeTabs" 
              component={HomeTabsNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EventDetail" 
              component={EventDetailScreen} 
              options={{ 
                headerTitle: 'Détails de l\'événement',
                headerTintColor: '#ff4757',
              }}
            />
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AdminUsers" 
              component={AdminUsersScreen} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AdminModeration" 
              component={AdminModerationScreen} 
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;