import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../constants/products';
import { ProductInput } from '../hooks/useProducts';
import Colors from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

interface ProductFormModalProps {
  visible: boolean;
  product?: Product | null; // null = create mode
  onSave: (data: ProductInput) => Promise<void>;
  onClose: () => void;
}

const EMPTY_FORM: ProductInput = {
  name: '',
  price: 0,
  category: '',
  image: '',
  rating: 5,
  reviewsCount: 0,
  description: '',
  colors: [],
  sizes: [],
  isFeatured: false,
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  onSave,
  onClose,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [colorsText, setColorsText] = useState('');
  const [sizesText, setSizesText] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isEdit = !!product;

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        description: product.description,
        colors: product.colors,
        sizes: product.sizes,
        isFeatured: product.isFeatured ?? false,
      });
      setColorsText(product.colors.join(', '));
      setSizesText(product.sizes.join(', '));
    } else {
      setForm(EMPTY_FORM);
      setColorsText('');
      setSizesText('');
    }
    setFieldErrors({});
  }, [product, visible]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'กรุณากรอกชื่อสินค้า';
    if (!form.price || isNaN(Number(form.price))) errs.price = 'กรุณากรอกราคา';
    if (!form.category.trim()) errs.category = 'กรุณากรอก Category';
    if (!form.image.trim()) errs.image = 'กรุณากรอก URL รูปภาพ';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload: ProductInput = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
        reviewsCount: Number(form.reviewsCount),
        colors: colorsText
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        sizes: sizesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setFieldErrors({
        general: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
  ];

  const labelStyle = [styles.label, { color: colors.tabIconDefault }];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.wrapper, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEdit ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.tint }]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* General Error */}
          {fieldErrors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorBannerText}>{fieldErrors.general}</Text>
            </View>
          )}

          {/* Name */}
          <Text style={labelStyle}>ชื่อสินค้า *</Text>
          <TextInput
            style={[inputStyle, fieldErrors.name ? styles.inputError : null]}
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="เช่น ASUS ROG RTX 4090"
            placeholderTextColor={colors.tabIconDefault}
          />
          {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}

          {/* Price */}
          <Text style={labelStyle}>ราคา (USD) *</Text>
          <TextInput
            style={[inputStyle, fieldErrors.price ? styles.inputError : null]}
            value={String(form.price)}
            onChangeText={(v) => setForm((f) => ({ ...f, price: Number(v) || 0 }))}
            placeholder="เช่น 1899.99"
            placeholderTextColor={colors.tabIconDefault}
            keyboardType="decimal-pad"
          />
          {fieldErrors.price && <Text style={styles.fieldError}>{fieldErrors.price}</Text>}

          {/* Category */}
          <Text style={labelStyle}>Category *</Text>
          <TextInput
            style={[inputStyle, fieldErrors.category ? styles.inputError : null]}
            value={form.category}
            onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
            placeholder="เช่น GPU, SSD, RAM, CPU, Peripherals"
            placeholderTextColor={colors.tabIconDefault}
          />
          {fieldErrors.category && <Text style={styles.fieldError}>{fieldErrors.category}</Text>}

          {/* Image */}
          <Text style={labelStyle}>URL รูปภาพ *</Text>
          <TextInput
            style={[inputStyle, fieldErrors.image ? styles.inputError : null]}
            value={form.image}
            onChangeText={(v) => setForm((f) => ({ ...f, image: v }))}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor={colors.tabIconDefault}
            autoCapitalize="none"
          />
          {fieldErrors.image && <Text style={styles.fieldError}>{fieldErrors.image}</Text>}

          {/* Description */}
          <Text style={labelStyle}>คำอธิบาย</Text>
          <TextInput
            style={[inputStyle, styles.textArea]}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="รายละเอียดสินค้า..."
            placeholderTextColor={colors.tabIconDefault}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Rating & Reviews — row */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={labelStyle}>Rating (0–5)</Text>
              <TextInput
                style={inputStyle}
                value={String(form.rating)}
                onChangeText={(v) => setForm((f) => ({ ...f, rating: Number(v) || 0 }))}
                placeholder="4.8"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={labelStyle}>จำนวนรีวิว</Text>
              <TextInput
                style={inputStyle}
                value={String(form.reviewsCount)}
                onChangeText={(v) => setForm((f) => ({ ...f, reviewsCount: Number(v) || 0 }))}
                placeholder="0"
                placeholderTextColor={colors.tabIconDefault}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Colors */}
          <Text style={labelStyle}>Colors (คั่นด้วย ,)</Text>
          <TextInput
            style={inputStyle}
            value={colorsText}
            onChangeText={setColorsText}
            placeholder="#1A1A1A, #FFFFFF"
            placeholderTextColor={colors.tabIconDefault}
          />

          {/* Sizes */}
          <Text style={labelStyle}>Sizes (คั่นด้วย ,)</Text>
          <TextInput
            style={inputStyle}
            value={sizesText}
            onChangeText={setSizesText}
            placeholder="1TB, 2TB, 4TB"
            placeholderTextColor={colors.tabIconDefault}
          />

          {/* isFeatured */}
          <View style={[styles.switchRow, { borderColor: colors.border }]}>
            <View>
              <Text style={[styles.switchLabel, { color: colors.text }]}>สินค้าแนะนำ (Featured)</Text>
              <Text style={[styles.switchSub, { color: colors.tabIconDefault }]}>
                แสดงในหน้าหลัก
              </Text>
            </View>
            <Switch
              value={form.isFeatured}
              onValueChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={form.isFeatured ? '#FFF' : colors.tabIconDefault}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  body: {
    padding: 20,
    paddingBottom: 60,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  switchSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
