import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { PRODUCTS } from '../../constants/products';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

const MOCK_ORDERS = [
  { id: 'ORD-99081', date: 'July 10, 2026', total: 429.98, status: 'Delivered' },
  { id: 'ORD-89122', date: 'June 28, 2026', total: 79.99, status: 'Delivered' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { favorites } = useCart();

  // Find favorite products
  const favoriteProducts = PRODUCTS.filter((p) => favorites.includes(p.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Info */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>John Doe</Text>
            <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>john.doe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.tint }]}>{MOCK_ORDERS.length}</Text>
            <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Orders</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.tint }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Wishlist</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.tint }]}>240</Text>
            <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Points</Text>
          </View>
        </View>

        {/* Wishlist Section */}
        {favoriteProducts.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Wishlist</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wishlistScroll}>
              {favoriteProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.wishlistCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/product/${product.id}`)}
                >
                  <Image source={{ uri: product.image }} style={styles.wishlistImage} />
                  <Text style={[styles.wishlistName, { color: colors.text }]} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={[styles.wishlistPrice, { color: colors.tint }]}>
                    ${product.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Order History */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Orders</Text>
          {MOCK_ORDERS.map((order) => (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderHeader}>
                <Text style={[styles.orderId, { color: colors.text }]}>{order.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.orderFooter}>
                <Text style={[styles.orderDate, { color: colors.tabIconDefault }]}>{order.date}</Text>
                <Text style={[styles.orderTotal, { color: colors.text }]}>Total: ${order.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Menu */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={20} color={colors.text} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Shipping Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={20} color={colors.text} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.tabIconDefault} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Log Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.tabIconDefault} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statNum: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  wishlistScroll: {
    paddingRight: 16,
  },
  wishlistCard: {
    width: 110,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginRight: 10,
  },
  wishlistImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  wishlistName: {
    fontSize: 11,
    fontWeight: '600',
  },
  wishlistPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  orderCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 11,
  },
  orderTotal: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContainer: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
