import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { useAuth } from '../context/AuthContext';

interface Address {
  id: string;
  type: string;
  name: string;
  street: string;
  city: string;
  country: string;
  phone: string;
}

export default function ShippingScreen() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [type, setType] = useState('Home');
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');

  const STORAGE_KEY = `@addresses_${user?.username || 'guest'}`;

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setAddresses(JSON.parse(data));
      } else {
        // Empty by default
        setAddresses([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveAddresses = async (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAddresses));
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setType('Home');
    setName('');
    setStreet('');
    setCity('');
    setCountry('');
    setPhone('');
    setIsModalVisible(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingId(addr.id);
    setType(addr.type);
    setName(addr.name);
    setStreet(addr.street);
    setCity(addr.city);
    setCountry(addr.country);
    setPhone(addr.phone);
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!name || !street || !city || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingId) {
      const updated = addresses.map(a => 
        a.id === editingId ? { id: editingId, type, name, street, city, country, phone } : a
      );
      saveAddresses(updated);
    } else {
      const newAddr: Address = {
        id: Date.now().toString(),
        type, name, street, city, country, phone
      };
      saveAddresses([...addresses, newAddr]);
    }
    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this address?')) {
        saveAddresses(addresses.filter(a => a.id !== id));
      }
    } else {
      Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          saveAddresses(addresses.filter(a => a.id !== id));
        }}
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerTitle: 'Shipping Addresses', headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {addresses.map((addr) => (
          <View key={addr.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Ionicons name={addr.type.includes('Work') ? 'briefcase' : 'home'} size={20} color={colors.tint} />
                <Text style={[styles.title, { color: colors.text }]}>{addr.type}</Text>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => openEditModal(addr)} style={styles.actionBtn}>
                  <Text style={[styles.editText, { color: colors.tint }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(addr.id)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.addressText, { color: colors.text }]}>{addr.name}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{addr.street}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{addr.city}</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>{addr.country}</Text>
            <Text style={[styles.phoneText, { color: colors.tabIconDefault }]}>{addr.phone}</Text>
          </View>
        ))}

        <TouchableOpacity style={[styles.addButton, { borderColor: colors.tint, borderStyle: 'dashed' }]} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={colors.tint} />
          <Text style={[styles.addButtonText, { color: colors.tint }]}>Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingId ? 'Edit Address' : 'New Address'}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Address Type</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={type} onChangeText={setType} placeholder="e.g. Home, Work" placeholderTextColor={colors.tabIconDefault} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={name} onChangeText={setName} placeholder="John Doe" placeholderTextColor={colors.tabIconDefault} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Street Address</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={street} onChangeText={setStreet} placeholder="123 Main St" placeholderTextColor={colors.tabIconDefault} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>City & Zip</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={city} onChangeText={setCity} placeholder="New York, NY 10001" placeholderTextColor={colors.tabIconDefault} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Country</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={country} onChangeText={setCountry} placeholder="United States" placeholderTextColor={colors.tabIconDefault} />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={phone} onChangeText={setPhone} placeholder="+1 234 567 8900" keyboardType="phone-pad" placeholderTextColor={colors.tabIconDefault} />

            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.tint }]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Address</Text>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { padding: 4 },
  editText: { fontSize: 14, fontWeight: '600' },
  addressText: { fontSize: 14, marginBottom: 4 },
  phoneText: { fontSize: 14, marginTop: 8 },
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
