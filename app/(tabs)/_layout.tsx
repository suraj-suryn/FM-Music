/**
 * app/(tabs)/_layout.tsx
 * Tab navigator: Library | Radio | Host
 */
import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MiniPlayer from '../../components/MiniPlayer';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#09090b' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#18181b',
            borderTopColor: '#3f3f46',
            borderTopWidth: 1,
          },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#71717a',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'Library', tabBarIcon: ({ color }) => <TabIcon label="🎵" color={color} /> }}
        />
        <Tabs.Screen
          name="radio"
          options={{ title: 'Radio', tabBarIcon: ({ color }) => <TabIcon label="📻" color={color} /> }}
        />
        <Tabs.Screen
          name="host"
          options={{ title: 'Host', tabBarIcon: ({ color }) => <TabIcon label="🎙" color={color} /> }}
        />
      </Tabs>

      {/* MiniPlayer sits between tab bar and content */}
      <View
        style={{
          position: 'absolute',
          bottom: 60, // tab bar height approx
          left: 0,
          right: 0,
        }}
      >
        <MiniPlayer />
      </View>
    </View>
  );
}

function TabIcon({ label }: { label: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20 }}>{label}</Text>;
}
