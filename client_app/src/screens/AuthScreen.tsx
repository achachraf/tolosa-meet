import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, error, clearError } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (isSignUp && !displayName)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    clearError();

    let success = false;
    if (isSignUp) {
      success = await signUp(email, password, displayName);
    } else {
      success = await signIn(email, password);
    }

    setLoading(false);

    if (!success && error) {
      Alert.alert('Error', error);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Logo />
            <Text style={styles.title}>
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Rejoignez la communauté toulousaine' 
                : 'Retrouvez vos événements préférés'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Nom d'affichage"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading 
                  ? 'Chargement...' 
                  : (isSignUp ? 'Créer un compte' : 'Se connecter')
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={toggleAuthMode}
            >
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Déjà un compte ? Se connecter'
                  : 'Pas de compte ? S\'inscrire'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default AuthScreen;
