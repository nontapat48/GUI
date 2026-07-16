import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRODUCTS, CATEGORIES, Product } from '../../constants/products';
import { ProductCard } from '../../components/ProductCard';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by category and search query
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Scrollable Content */}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header Greeting */}
            <View style={styles.headerGreeting}>
              <Text style={[styles.welcomeText, { color: colors.tabIconDefault }]}>
                Gear Up, Player!
              </Text>
              <Text style={[styles.discoverText, { color: colors.text }]}>
                Build Your Dream Rig
              </Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.tabIconDefault} style={styles.searchIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Search GPU, SSD, RAM..."
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

            {/* Promo Banner Card */}
            <View style={[styles.promoCard, { backgroundColor: colors.tint }]}>
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoLabel}>Gamer's Upgrade</Text>
                <Text style={styles.promoHeading}>Elite Power</Text>
                <Text style={styles.promoDiscount}>Next-Gen PC Parts</Text>
                <TouchableOpacity style={styles.promoButton}>
                  <Text style={[styles.promoButtonText, { color: colors.tint }]}>Explore</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=60',
                }}
                style={styles.promoImage}
              />
            </View>

            {/* Categories Horizontal Scroller */}
            <View style={styles.categoriesSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              >
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryBtn,
                        {
                          backgroundColor: isSelected ? colors.tint : colors.card,
                          borderColor: isSelected ? colors.tint : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
                          {
                            color: isSelected ? '#FFF' : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Grid Title */}
            <View style={styles.featuredHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory === 'All' ? 'Featured Products' : `${selectedCategory} Products`}
              </Text>
              <Text style={[styles.resultsCount, { color: colors.tabIconDefault }]}>
                {filteredProducts.length} items
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No products found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
              Try searching for something else or clear filters
            </Text>
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
  row: {
    justifyContent: 'space-between',
  },
  headerGreeting: {
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  discoverText: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  promoCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    height: 150,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  promoTextContainer: {
    flex: 1.2,
    zIndex: 2,
  },
  promoLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promoHeading: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  promoDiscount: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  promoButton: {
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  promoImage: {
    flex: 0.8,
    height: 160,
    width: 140,
    position: 'absolute',
    right: -10,
    bottom: -20,
    transform: [{ rotate: '-10deg' }],
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryBtnText: {
    fontSize: 13,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    maxWidth: 240,
  },
});
