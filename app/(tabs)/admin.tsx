import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts, ProductInput } from '../../hooks/useProducts';
import { ProductFormModal } from '../../components/ProductFormModal';
import { Product } from '../../constants/products';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function AdminScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const { products, loading, error, refetch, createProduct, updateProduct, deleteProduct } =
    useProducts();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ---- ADD ----
  function openAdd() {
    setEditingProduct(null);
    setModalVisible(true);
  }

  // ---- EDIT ----
  function openEdit(product: Product) {
    setEditingProduct(product);
    setModalVisible(true);
  }

  // ---- SAVE (add หรือ edit) ----
  async function handleSave(data: ProductInput) {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
    } else {
      await createProduct(data);
    }
  }

  // ---- DELETE CONFIRM ----
  function confirmDelete(product: Product) {
    setDeleteTarget(product);
    setDeleteError(null);
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบสินค้า');
    } finally {
      setIsDeleting(false);
    }
  }

  // ---- RENDER ----
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>จัดการสินค้า</Text>
          <Text style={[styles.headerSub, { color: colors.tabIconDefault }]}>
            {products.length} รายการ
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.tint }]}
          onPress={openAdd}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>เพิ่มสินค้า</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && products.length === 0 && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.tabIconDefault }]}>กำลังโหลด...</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={[styles.errorBox, { backgroundColor: '#FEE2E2' }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retryText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <ScrollView contentContainerStyle={styles.list}>
        {products.map((item) => (
          <View
            key={String(item.id)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* รูป */}
            <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />

            {/* ข้อมูล */}
            <View style={styles.info}>
              <View style={styles.idBadgeContainer}>
                <Text style={[styles.category, { color: colors.tint }]}>{item.category}</Text>
                <Text style={[styles.idText, { color: colors.tabIconDefault }]}>ID: {item.id}</Text>
              </View>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.price, { color: colors.text }]}>
                ${item.price.toFixed(2)}
              </Text>
            </View>

            {/* ปุ่ม */}
            <View style={styles.btnCol}>
              {/* ปุ่ม Edit */}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.tint }]}
                onPress={() => openEdit(item)}
              >
                <Ionicons name="create-outline" size={16} color="#FFF" />
              </TouchableOpacity>

              {/* ปุ่ม Delete */}
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#EF4444' }]}
                onPress={() => confirmDelete(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={48} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              ยังไม่มีสินค้า กดปุ่มเพิ่มสินค้าด้านบน
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Product Form Modal */}
      <ProductFormModal
        visible={modalVisible}
        product={editingProduct}
        onSave={handleSave}
        onClose={() => setModalVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.deleteIconCircle}>
              <Ionicons name="trash-outline" size={28} color="#EF4444" />
            </View>
            <Text style={[styles.deleteModalTitle, { color: colors.text }]}>
              ยืนยันการลบสินค้า
            </Text>
            <Text style={[styles.deleteModalSub, { color: colors.tabIconDefault }]}>
              คุณต้องการลบ "{deleteTarget?.name}" (ID: {deleteTarget?.id}) ใช่หรือไม่? ข้อมูลจะถูกลบออกจากระบบอย่างถาวร
            </Text>

            {deleteError && (
              <View style={styles.deleteErrorContainer}>
                <Text style={styles.deleteErrorText}>{deleteError}</Text>
              </View>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn, { borderColor: colors.border }]}
                onPress={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                <Text style={[styles.cancelModalBtnText, { color: colors.text }]}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmDeleteBtn]}
                onPress={executeDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>ลบสินค้า</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub: { fontSize: 12, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingHorizontal: 16,
  },
  loadingText: { fontSize: 13 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  retryText: { color: '#EF4444', fontWeight: '700', fontSize: 13, marginLeft: 8 },

  list: { padding: 16, paddingBottom: 40 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    gap: 10,
  },
  thumb: { width: 70, height: 70, borderRadius: 8 },
  info: { flex: 1, gap: 2 },
  idBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  category: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  idText: { fontSize: 10, fontWeight: '500' },
  name: { fontSize: 13, fontWeight: '600' },
  price: { fontSize: 13, fontWeight: '700' },

  btnCol: { gap: 8 },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 240 },

  // Delete Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  deleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  deleteModalSub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  deleteErrorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  deleteErrorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalBtn: {
    borderWidth: 1,
  },
  cancelModalBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  confirmDeleteBtn: {
    backgroundColor: '#EF4444',
  },
  confirmDeleteBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
