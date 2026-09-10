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
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, PRODUCTS } from '../../constants/products';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/ProductCard';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useCart } from '../../context/CartContext';
import { AnimatedRGB } from '../../components/AnimatedRGB';

// TypeWriter Component
const TypeWriter = ({ text, style, delay = 50, onComplete = () => {} }: { text: string, style?: any, delay?: number, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  React.useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        onComplete();
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <Text style={style}>{displayedText}</Text>;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [startSecondLine, setStartSecondLine] = useState(false);
  const { addToCart } = useCart();

  // ดึงข้อมูลสินค้าจาก API
  const { products, loading, error, refetch } = useProducts();

  // กรองสินค้าตาม category และ search
  const productList = Array.isArray(products) && products.length > 0 ? products : PRODUCTS;
  const filteredProducts = (productList || []).filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (product.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Loading State ---
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.statusText, { color: colors.tabIconDefault }]}>
          กำลังโหลดสินค้า...
        </Text>
      </View>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={56} color={colors.tabIconDefault} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>โหลดข้อมูลไม่สำเร็จ</Text>
        <Text style={[styles.errorDetail, { color: colors.tabIconDefault }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.tint }]}
          onPress={refetch}
        >
          <Ionicons name="refresh-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.retryBtnText}>ลองใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Main UI ---
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.headerGreeting}>
              <TypeWriter 
                text="Gear Up, Player!" 
                style={[styles.welcomeText, { color: colors.tabIconDefault }]} 
                delay={50}
                onComplete={() => setStartSecondLine(true)}
              />
              <Text style={[styles.discoverText, { color: colors.text, opacity: startSecondLine ? 1 : 0 }]}>
                {startSecondLine ? (
                  <TypeWriter 
                    text="Build Your Dream Rig" 
                    style={[styles.discoverText, { color: colors.text }]} 
                    delay={70}
                  />
                ) : (
                  " " // placeholder to keep layout stable
                )}
              </Text>
            </View>

            {/* Search Bar */}
            <View
              style={[
                styles.searchSection,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={colors.tabIconDefault}
                style={styles.searchIcon}
              />
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

            {/* Promo Banner */}
            <AnimatedRGB isBorder style={{ borderRadius: 18, marginBottom: 24 }}>
              <Pressable 
                style={[
                  styles.promoCard, 
                  { backgroundColor: colors.card },
                  isBannerHovered && styles.promoCardHovered
                ]}
                // @ts-ignore
                onHoverIn={() => setIsBannerHovered(true)}
                onHoverOut={() => setIsBannerHovered(false)}
                onPress={() => setSelectedCategory('All')}
              >
                {/* Left Content */}
                <View style={styles.promoTextContainer}>
                  <View style={styles.discountTag}>
                    <Text style={styles.discountTagText}>UP TO 20% OFF</Text>
                  </View>
                  <Text style={[styles.promoHeading, { color: colors.text }]}>Elite Power</Text>
                  <Text style={styles.promoDiscount}>Next-Gen PC Parts</Text>
                  
                  {/* Trust Badges */}
                  <View style={styles.badgesRow}>
                    <View style={styles.trustBadge}>
                      <Ionicons name="card" size={12} color={colors.tint} />
                      <Text style={[styles.trustBadgeText, { color: colors.text }]}>0% Installment</Text>
                    </View>
                    <View style={styles.trustBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={colors.tint} />
                      <Text style={[styles.trustBadgeText, { color: colors.text }]}>3 Yrs Warranty</Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.promoButton, { backgroundColor: colors.tint }]}
                    onPress={() => setSelectedCategory('All')}
                  >
                    <Text style={[styles.promoButtonText, { color: '#000' }]}>Shop Now</Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>

                {/* Right Content: Multi-Product Grid */}
                <View style={styles.promoProductsArea}>
                  {productList && productList.slice(0, 3).map((p, i) => (
                    <View 
                      key={p.id} 
                      style={[
                        styles.promoMiniCard, 
                        { 
                          right: i * 55, // Increased spread from 40 to 55 to fill dead space
                          top: (i * 20), // Adjusted top offset for better cascading
                          zIndex: 3 - i,
                          transform: [{ scale: 1 - (i * 0.05) }, { rotate: `${-10 + (i * 10)}deg` }] // More dynamic rotation
                        }
                      ]}
                    >
                      <Image source={{ uri: p.image }} style={styles.promoMiniImage} />
                    </View>
                  ))}
                </View>
              </Pressable>
            </AnimatedRGB>


            {/* Categories */}
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
                {selectedCategory === 'All'
                  ? 'Featured Products'
                  : `${selectedCategory} Products`}
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
            <Text style={[styles.emptyText, { color: colors.text }]}>No products found</Text>
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

  // Center (loading / error)
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorDetail: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Header
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

  // Search
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

  // Promo
  promoCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
  },
  promoTextContainer: {
    flex: 1.3,
    zIndex: 10,
    justifyContent: 'center',
  },
  discountTag: {
    backgroundColor: '#FF003C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  discountTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  promoHeading: {
    fontSize: 26,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  promoDiscount: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  trustBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 6,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  promoProductsArea: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  promoMiniCard: {
    position: 'absolute',
    width: 140, // Increased from 100
    height: 140, // Increased from 100
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, // Smoother corners for larger cards
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 10, // Increased padding
    shadowColor: '#00F0FF', // Cyan glow shadow
    shadowOffset: { width: -5, height: 10 }, // Stronger 3D drop shadow
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoMiniImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  promoCardHovered: {
    transform: [{ scale: 1.01 }],
  },

  // Categories
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

  // Grid header
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 12,
  },

  // Empty
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
