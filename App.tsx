import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
    Home as HomeIcon, 
    Search as SearchIcon, 
    LayoutDashboard, 
    User as UserIcon 
} from 'lucide-react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen, ProfileScreen } from './src/screens/AuthAndProfile';
import Dashboard from './src/screens/Dashboard';
import SearchScreen from './src/screens/Search';
import ManagementScreen from './src/screens/Management';
import { PropertyDetailScreen } from './src/screens/PropertyDetail';
import { PostListingScreen } from './src/screens/ListingActions';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0061A4',
        tabBarInactiveTintColor: '#74777F',
        tabBarStyle: {
          height: 70,
          paddingBottom: 15,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F1F3F9',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <SearchIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Manage" 
        component={ManagementScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="MyProfile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="HomeTabs" component={MainTabs} />
            <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
            <Stack.Screen name="PostListing" component={PostListingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
