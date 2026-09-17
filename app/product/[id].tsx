import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS } from '../../constants/products';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { products } = useProducts();
  const productList = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;

  // Find product by id
  const product = (productList || []).find((p) => String(p.id) === String(id));

  const safeColors = product && Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ['Default'];
  const safeSizes = product && Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['Default'];

  const [selectedColor, setSelectedColor] = useState(safeColors[0]);
  const [selectedSize, setSelectedSize] = useState(safeSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const favorite = product ? isFavorite(product.id) : false;

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (!product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="warning-outline" size={48} color={colors.tabIconDefault} />
        <Text style={[styles.errorText, { color: colors.text }]}>Product Not Found</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.tint }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    // Navigate to Cart Tab
    router.replace('/(tabs)/cart');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Configure Stack Header */}
      <Stack.Screen
        options={{
          headerTitle: 'Product Details',
          headerRight: () => (
            <TouchableOpacity onPress={() => toggleFavorite(product.id)} style={{ marginRight: 8 }}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? '#EF4444' : colors.text}
              />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Large Product Image */}
        <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />

        <View style={[styles.infoWrapper, { backgroundColor: colors.card }]}>
          {/* Category & Title */}
          <Text style={[styles.categoryText, { color: colors.tint }]}>{product.category}</Text>
          <Text style={[styles.titleText, { color: colors.text }]}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={[styles.ratingVal, { color: colors.text }]}>{product.rating}</Text>
            </View>
            <Text style={[styles.reviewsText, { color: colors.tabIconDefault }]}>
              {product.reviewsCount} customer reviews
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Description</Text>
          <Text style={[styles.descText, { color: colors.text }]}>{product.description}</Text>

          {/* Color Selector */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Select Color</Text>
          <View style={styles.colorsRow}>
            {safeColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color, borderColor: isSelected ? colors.tint : 'transparent' },
                    isSelected && styles.selectedCircle,
                  ]}
                />
              );
            })}
          </View>

          {/* Size Selector */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>Select Size</Text>
          <View style={styles.sizesRow}>
            {safeSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.sizeBtn,
                    {
                      backgroundColor: isSelected ? colors.tint : colors.background,
                      borderColor: isSelected ? colors.tint : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      { color: isSelected ? '#FFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantity Selector - Hidden for Admin */}
          {user?.role !== 'admin' && (
            <>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Quantity</Text>
              <View style={[styles.quantityRow, { borderColor: colors.border }]}>
                <TouchableOpacity onPress={decrementQty} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={18} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity onPress={incrementQty} style={styles.qtyBtn}>
                  <Ionicons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buy CTA Bar - Hidden for Admin */}
      {user?.role !== 'admin' && (
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.priceContainer}>
            <Text style={[styles.totalLabel, { color: colors.tabIconDefault }]}>Total Price</Text>
            <Text style={[styles.totalPrice, { color: colors.text }]}>
              ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: colors.tint }]} onPress={handleAddToCart}>
            <Ionicons name="cart" size={20} color="#FFF" style={styles.cartIcon} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom CTA bar
  },
  productImage: {
    width: width,
    height: 320,
  },
  infoWrapper: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
    padding: 24,
    minHeight: 400,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  ratingVal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 12,
  },
  selectedCircle: {
    transform: [{ scale: 1.15 }],
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 50,
    alignItems: 'center',
  },
  sizeText: {
    fontSize: 13,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    width: 120,
    height: 40,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  qtyBtn: {
    width: 36,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  totalLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  addToCartBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 24,
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
