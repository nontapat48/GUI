import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart, Order } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PRODUCTS } from '../../constants/products';
import { useProducts } from '../../hooks/useProducts';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { favorites, orders } = useCart();
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const productList = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;

  // Get initials from username
  const displayName = user?.username || 'Guest';
  const initials = displayName.slice(0, 2).toUpperCase();

  // Find favorite products
  const favoriteProducts = (productList || []).filter((p) => favorites.includes(String(p.id)));

  const statusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#10B981';
      case 'Processing': return '#F59E0B';
      case 'Shipped': return '#6366F1';
      default: return '#6B7280';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Profile Info */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
              {user?.role === 'admin' && (
                <View style={[styles.roleBadge, { backgroundColor: colors.tint }]}>
                  <Ionicons name="build" size={10} color="#FFF" />
                  <Text style={styles.roleBadgeText}> Admin</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userRole, { color: colors.tabIconDefault }]}>
              {user?.role === 'admin' ? 'Store Administrator' : 'Customer Account'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.tint }]}>{orders.length}</Text>
            <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Orders</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.tint }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Wishlist</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statNum, { color: colors.tint }]}>
              ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Spent</Text>
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
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Action Menu */}
        <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.menuItem} onPress={logout}>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
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
  emptyOrders: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyOrderText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderItemImg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
  },
  orderItemName: {
    fontSize: 12,
    flex: 1,
  },
  moreItems: {
    fontSize: 11,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
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
