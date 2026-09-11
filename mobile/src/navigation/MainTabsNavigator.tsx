import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { FeedScreen } from '../screens/FeedScreen';
import { AnonymousScreen } from '../screens/AnonymousScreen';
import { HostelScreen } from '../screens/HostelScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { AcademicScreen } from '../screens/AcademicScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0F172A' },
        headerTitleStyle: { color: '#FFFFFF', fontWeight: '900' },
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#FFFC00',
        tabBarInactiveTintColor: '#64748B',
        tabBarIcon: ({ focused }) => {
          let icon = '🔥';
          if (route.name === 'Gists') icon = '🔥';
          else if (route.name === 'Anon') icon = '👻';
          else if (route.name === 'Hostels') icon = '🏠';
          else if (route.name === 'Market') icon = '🛍️';
          else if (route.name === 'Chats') icon = '💬';
          else if (route.name === 'Academic') icon = '📚';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Gists" component={FeedScreen} options={{ title: 'Campus Gists' }} />
      <Tab.Screen name="Anon" component={AnonymousScreen} options={{ title: 'Anon Zone' }} />
      <Tab.Screen name="Hostels" component={HostelScreen} options={{ title: 'Hostel Hub' }} />
      <Tab.Screen name="Market" component={MarketplaceScreen} options={{ title: 'Marketplace' }} />
      <Tab.Screen name="Chats" component={MessagesScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="Academic" component={AcademicScreen} options={{ title: 'Academic' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
