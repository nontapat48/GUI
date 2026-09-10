import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Animated, Easing } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuth();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  // Continuous rotation for HUD rings
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
        isInteraction: false,
      }).start(({ finished }) => {
        if (finished) {
          startAnimation();
        }
      });
    };
    
    startAnimation();
  }, [spinAnim]);

  const spinForward = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const spinBackward = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg']
  });

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('System Error', 'Required parameters missing.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Verification Failed', 'Passcodes do not match.');
      return;
    }

    try {
      await register(username, password);
      Alert.alert(
        'Registration Complete',
        'New user identity established. Proceed to login.',
        [{ text: 'PROCEED', onPress: () => router.push('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'System rejection');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {/* Animated Cyber HUD Lock */}
        <View style={styles.hudContainer}>
          <Animated.View style={[styles.hudRingOuter, { transform: [{ rotate: spinForward }] }]} />
          <Animated.View style={[styles.hudRingMiddle, { transform: [{ rotate: spinBackward }] }]} />
          <View style={styles.hudRingInner} />
          <Ionicons name="person-add" size={48} color={colors.tint} style={styles.lockIcon} />
        </View>

        <Text style={[styles.title, { color: colors.tint }]}>NEW IDENTITY</Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>CREATE SYSTEM ACCOUNT</Text>
      </View>

      <View style={styles.form}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="person-outline" size={20} color={colors.tint} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Choose Username / ID"
            placeholderTextColor={colors.tabIconDefault}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.tint} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Set Passcode"
            placeholderTextColor={colors.tabIconDefault}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.tint} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Confirm Passcode"
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
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>REGISTER IDENTITY</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.tabIconDefault }]}>EXISTING USER? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.linkText, { color: colors.tint }]}>SYSTEM LOGIN</Text>
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
  // HUD Styles
  hudContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  hudRingOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#00F0FF',
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  hudRingMiddle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#00F0FF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    opacity: 0.9,
  },
  hudRingInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#00F0FF',
    opacity: 0.5,
  },
  lockIcon: {
    textShadowColor: '#00F0FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 16,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: 16,
    letterSpacing: 1,
    // @ts-ignore
    outlineStyle: 'none',
  },
  button: {
    height: 54,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  linkText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
});
