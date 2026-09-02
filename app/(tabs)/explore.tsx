import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, Product } from '../../constants/products';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

const { width } = Dimensions.get('window');
const CATEGORY_CARDS = [
  { name: 'Electronics', icon: 'desktop-outline', count: 3, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60' },
  { name: 'Apparel', icon: 'shirt-outline', count: 1, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=60' },
  { name: 'Accessories', icon: 'watch-outline', count: 3, image: 'https://images.unsplash.com/photo-1627124765135-566b68a24c5b?w=300&auto=format&fit=crop&q=60' },
  { name: 'Shoes', icon: 'footsteps-outline', count: 1, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&auto=format&fit=crop&q=60' },
];

const TRENDING_SEARCHES = ['Sony', 'Sneakers', 'Watch', 'Coat', 'Wallet'];

export default function ExploreScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { products } = useProducts();
  const productList = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;

  const filteredProducts = (productList || []).filter((product) => {
    const matchesSearch =
      (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleTrendingPress = (term: string) => {
    setSearchQuery(term);
    setSelectedCategory(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Search Box */}
      <View style={[styles.searchHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#111827' : '#F3F4F6', borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.tabIconDefault} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={selectedCategory ? `Search in ${selectedCategory}...` : "Search products, brands, tags..."}
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.tabIconDefault} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Active Category Tag */}
        {selectedCategory && (
          <View style={styles.activeFilterContainer}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>Filtering by: </Text>
            <View style={[styles.filterTag, { backgroundColor: colors.tint }]}>
              <Text style={styles.filterTagText}>{selectedCategory}</Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.closeTagButton}>
                <Ionicons name="close" size={12} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* If no searching and no active category filter, show default navigation */}
        {searchQuery === '' && !selectedCategory ? (
          <>
            {/* Category Cards Grid */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse Categories</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_CARDS.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleCategoryPress(cat.name)}
                >
                  <Image source={{ uri: cat.image }} style={styles.categoryImage} resizeMode="cover" />
                  <View style={styles.categoryOverlay}>
                    <View style={styles.categoryInfo}>
                      <Ionicons name={cat.icon as any} size={20} color="#FFF" />
                      <Text style={styles.categoryName}>{cat.name}</Text>
                      <Text style={styles.categoryCount}>{cat.count} Items</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Trending Searches */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}>Trending Searches</Text>
            <View style={styles.trendingContainer}>
              {TRENDING_SEARCHES.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={[styles.trendingTag, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleTrendingPress(term)}
                >
                  <Ionicons name="trending-up" size={14} color={colors.tint} style={styles.trendingIcon} />
                  <Text style={[styles.trendingText, { color: colors.text }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recommended Products */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 12 }]}>
              Recommended for You
            </Text>
            <FlatList
              data={(productList || []).slice(0, 4)}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          /* Search/Filter Results Grid */
          <View>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>Search Results</Text>
              <Text style={[styles.resultsCount, { color: colors.tabIconDefault }]}>
                {filteredProducts.length} items found
              </Text>
            </View>
            {filteredProducts.length > 0 ? (
              <FlatList
                data={filteredProducts}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.tabIconDefault} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No matching items</Text>
                <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
                  Try general terms or check spelling.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  filterTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeTagButton: {
    marginLeft: 4,
    padding: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    width: (width - 44) / 2,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  categoryInfo: {
    alignItems: 'flex-start',
  },
  categoryName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  categoryCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  trendingIcon: {
    marginRight: 4,
  },
  trendingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    justifyContent: 'space-between',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
