import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { registerUser } from '../../store/slices/authSlice';

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'fan' as 'fan' | 'artist',
  });
  
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleRegister = async () => {
    const { username, email, password, confirmPassword, role } = formData;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(registerUser({ email, password, fullName: username, role })).unwrap();
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Join Not a Label</Text>
            <Text style={styles.subtitle}>Create your account</Text>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'fan' && styles.roleButtonActive
                    ]}
                    onPress={() => updateFormData('role', 'fan')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === 'fan' && styles.roleButtonTextActive
                    ]}>
                      Music Fan
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'artist' && styles.roleButtonActive
                    ]}
                    onPress={() => updateFormData('role', 'artist')}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === 'artist' && styles.roleButtonTextActive
                    ]}>
                      Artist
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ffaa',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  roleSelector: {
    marginBottom: 20,
  },
  roleLabel: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#00ffaa',
    borderColor: '#00ffaa',
  },
  roleButtonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#00ffaa',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#ccc',
    fontSize: 14,
  },
  linkText: {
    color: '#00ffaa',
    fontSize: 14,
    fontWeight: '600',
  },
});