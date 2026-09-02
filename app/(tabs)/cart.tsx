import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart, CartItem, Order } from '../../context/CartContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart, addOrder } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal > 200 ? 0 : 15) : 0; // Free shipping for orders over $200
  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (isProcessing) return;
    Alert.alert(
      'Confirm Order',
      `Place order for $${total.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            setIsProcessing(true);
            // Simulate payment processing
            await new Promise((res) => setTimeout(res, 1500));

            const orderId = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const newOrder: Order = {
              id: orderId,
              date: dateStr,
              total: total,
              status: 'Processing',
              items: [...cartItems],
            };

            addOrder(newOrder);
            clearCart();
            setIsProcessing(false);

            Alert.alert(
              '🎉 Order Placed!',
              `Order ${orderId} placed successfully! Check your profile for order status.`,
              [{ text: 'Awesome!', onPress: () => router.push('/(tabs)/profile') }]
            );
          },
        },
      ]
    );
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <View style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Image source={{ uri: item.product.image }} style={styles.productImage} />
        
        <View style={styles.itemInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
            {item.product.name}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <View style={[styles.colorIndicator, { backgroundColor: item.selectedColor }]} />
            </View>
            <View style={[styles.metaBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metaText, { color: colors.text }]}>{item.selectedSize}</Text>
            </View>
          </View>
          
          <Text style={[styles.productPrice, { color: colors.text }]}>
            ${item.product.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.actionColumn}>
          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>

          {/* Quantity Controls */}
          <View style={[styles.quantityBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="remove" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
              style={styles.qtyBtn}
            >
              <Ionicons name="add" size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="cart-outline" size={80} color={colors.tabIconDefault} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
        <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
          Looks like you haven't added anything to your cart yet.
        </Text>
        <TouchableOpacity
          style={[styles.shopBtn, { backgroundColor: colors.tint }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => `${item.product.id}-${item.selectedColor}-${item.selectedSize}-${index}`}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.summaryContainer}>
            {/* Price breakdown */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.tabIconDefault }}>Subtotal</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>${subtotal.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.tabIconDefault }}>Shipping</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={{ color: colors.tabIconDefault }}>Tax (7%)</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>${tax.toFixed(2)}</Text>
              </View>

              {shipping > 0 && (
                <Text style={[styles.shippingNote, { color: colors.tint }]}>
                  *Add ${(200 - subtotal).toFixed(2)} more for FREE shipping
                </Text>
              )}

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                <Text style={[styles.totalValue, { color: colors.tint }]}>${total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: colors.tint, opacity: isProcessing ? 0.7 : 1 }]}
              onPress={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator color="#FFF" size="small" style={{ marginRight: 8 }} />
                  <Text style={styles.checkoutBtnText}>Processing Payment...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" style={styles.checkoutIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  cartCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 80,
    paddingVertical: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 6,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  deleteBtn: {
    padding: 4,
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    height: 28,
    width: 80,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 24,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 260,
  },
  shopBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  shopBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  summaryContainer: {
    marginTop: 16,
    marginBottom: 40,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shippingNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutIcon: {
    marginLeft: 8,
  },
});
