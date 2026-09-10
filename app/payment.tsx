import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { useAuth } from '../context/AuthContext';

interface PaymentMethod {
  id: string;
  cardNumber: string;
  expiry: string;
  cardholderName: string;
}

export default function PaymentScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const STORAGE_KEY = `@payments_${user?.username || 'guest'}`;

  useEffect(() => {
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setPayments(JSON.parse(data));
      } else {
        // Empty by default
        setPayments([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const savePayments = async (newPayments: PaymentMethod[]) => {
    setPayments(newPayments);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPayments));
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setCardNumber('');
    setExpiry('');
    setCardholderName('');
    setIsModalVisible(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingId(method.id);
    setCardNumber(method.cardNumber);
    setExpiry(method.expiry);
    setCardholderName(method.cardholderName);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!cardNumber || !expiry || !cardholderName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingId) {
      const updated = payments.map(p => 
        p.id === editingId ? { id: editingId, cardNumber, expiry, cardholderName } : p
      );
      savePayments(updated);
    } else {
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        cardNumber, expiry, cardholderName
      };
      savePayments([...payments, newMethod]);
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this card?')) {
        savePayments(payments.filter(p => p.id !== id));
      }
    } else {
      Alert.alert('Delete Payment Method', 'Are you sure you want to delete this card?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          savePayments(payments.filter(p => p.id !== id));
        }}
      ]);
    }
  };

  const maskCardNumber = (number: string) => {
    const last4 = number.slice(-4);
    return `•••• •••• •••• ${last4.padStart(4, '*')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerTitle: 'Payment Methods', headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {payments.map((method) => (
          <View key={method.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Ionicons name="card" size={24} color={colors.tint} />
                <Text style={[styles.title, { color: colors.text }]}>{maskCardNumber(method.cardNumber)}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => openEditModal(method)} style={styles.actionBtn}>
                  <Text style={[styles.editText, { color: colors.tint }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(method.id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.subText, { color: colors.tabIconDefault }]}>Expires {method.expiry}</Text>
            <Text style={[styles.nameText, { color: colors.text }]}>{method.cardholderName}</Text>
          </View>
        ))}

        <TouchableOpacity style={[styles.addButton, { borderColor: colors.tint, borderStyle: 'dashed' }]} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={colors.tint} />
          <Text style={[styles.addButtonText, { color: colors.tint }]}>Add New Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingId ? 'Edit Card' : 'New Card'}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Cardholder Name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={cardholderName} onChangeText={setCardholderName} placeholder="John Doe" placeholderTextColor={colors.tabIconDefault} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Card Number</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={cardNumber} onChangeText={setCardNumber} placeholder="1234 5678 1234 5678" keyboardType="number-pad" placeholderTextColor={colors.tabIconDefault} maxLength={16} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry Date (MM/YY)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={expiry} onChangeText={setExpiry} placeholder="12/25" keyboardType="numbers-and-punctuation" placeholderTextColor={colors.tabIconDefault} maxLength={5} />

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Card</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { borderRadius: 12, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { padding: 4 },
  editText: { fontSize: 14, fontWeight: '600' },
  subText: { fontSize: 14, marginBottom: 4 },
  nameText: { fontSize: 15, fontWeight: '500' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  addButtonText: { fontSize: 16, fontWeight: 'bold' },

  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalContent: { padding: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  saveButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
