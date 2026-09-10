import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { user } = useAuth();

  const headerStyle = {
    fontWeight: '900' as const,
    color: '#FFF',
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 1,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          elevation: 5,
          shadowOpacity: 0.1,
          shadowRadius: 5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: headerStyle,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Apex Gaming Tech',
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bag-handle' : 'bag-handle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'My Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
              {cartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: user?.role === 'admin' ? '/(tabs)/admin' : null,
          title: 'Manage',
          tabBarLabel: 'Manage',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'build' : 'build-outline'} size={24} color={color} />
          ),
        }}
      />
      {/* Hide two.tsx which was in the template */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
