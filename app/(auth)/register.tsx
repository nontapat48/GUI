import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register, isLoading } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!username || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    try {
      await register(username, password);
      setSuccessMsg('Account created successfully. Redirecting to log in...');
      setTimeout(() => {
        router.push('/(auth)/login');
      }, 1500);
    } catch (error: any) {
      setErrorMsg(error.message || 'Something went wrong');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="person-add-outline" size={80} color={colors.tint} />
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>Sign up to get started</Text>
      </View>

      <View style={styles.form}>
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
        
        {successMsg ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

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

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.tabIconDefault} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Confirm Password"
            placeholderTextColor={colors.tabIconDefault}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.tint, opacity: isLoading ? 0.7 : 1 }]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: colors.tint }]}>Log In</Text>
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: '#15803D',
    textAlign: 'center',
    fontSize: 14,
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
