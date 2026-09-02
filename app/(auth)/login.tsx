import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      await login(username, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="game-controller-outline" size={80} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Log in to your account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Username"
            placeholderTextColor={colors.tabIconDefault}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Password"
            placeholderTextColor={colors.tabIconDefault}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 }]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: colors.tint }]}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
