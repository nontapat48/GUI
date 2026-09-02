import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../constants/products';
import { useCart } from '../context/CartContext';
import Colors from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 column layout with padding

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { toggleFavorite, isFavorite, addToCart } = useCart();

  const favorite = isFavorite(product.id);

  const handleAddToCart = (e: any) => {
    // Prevent navigating to product details
    e.stopPropagation();
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Default';
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Default';
    addToCart(product, 1, defaultColor, defaultSize);
  };

  return (
    <Link href={`/product/${product.id}`} asChild>
      <TouchableOpacity style={StyleSheet.flatten([styles.card, { backgroundColor: colors.card, borderColor: colors.border }])}>
        {/* Wishlist Button */}
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)' }]}
          onPress={() => toggleFavorite(product.id)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={favorite ? '#EF4444' : colors.text}
          />
        </TouchableOpacity>

        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.category, { color: colors.tabIconDefault }]}>{product.category}</Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {product.name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.text }]}>{product.rating ?? 5.0}</Text>
            <Text style={[styles.reviewsCount, { color: colors.tabIconDefault }]}>
              ({product.reviewsCount ?? 0})
            </Text>
          </View>

          {/* Bottom row: Price & Cart Button */}
          <View style={styles.footer}>
            <Text style={[styles.price, { color: colors.text }]}>
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </Text>
            <TouchableOpacity
              style={[styles.cartButton, { backgroundColor: colors.tint }]}
              onPress={handleAddToCart}
            >
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 150,
  },
  infoContainer: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 10,
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
