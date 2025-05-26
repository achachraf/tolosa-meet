import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { categories } from '../data/mockData';
import firestore from '@react-native-firebase/firestore';

const CreateEventScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const validateForm = () => {
    if (!title || !description || !date || !time || !location || !address || !category) {
      Alert.alert('Champs obligatoires', 'Veuillez remplir tous les champs obligatoires.');
      return false;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Format de date invalide', 'Veuillez utiliser le format AAAA-MM-JJ.');
      return false;
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert('Format d\'heure invalide', 'Veuillez utiliser le format HH:MM.');
      return false;
    }
    
    return true;
  };

  const handleCreateEvent = async () => {
    if (validateForm()) {
      try {
        await firestore().collection('events').add({
          title,
          description,
          date,
          time,
          location,
          address,
          category,
          price: price ? parseFloat(price) : 0,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
          attendees: 0,
          isJoined: false,
        });
        Alert.alert(
          'Événement créé',
          'Votre événement a été créé avec succès!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setTitle('');
                setDescription('');
                setDate('');
                setTime('');
                setLocation('');
                setAddress('');
                setCategory('');
                setPrice('');
                setMaxAttendees('');
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l\'événement.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Créer un événement</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Titre *</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Donnez un titre à votre événement"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre événement"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.textInput}
                value={date}
                onChangeText={setDate}
                placeholder="AAAA-MM-JJ"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Heure *</Text>
              <TextInput
                style={styles.textInput}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Lieu *</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Nom de l'établissement, parc, etc."
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Adresse *</Text>
            <TextInput
              style={styles.textInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Adresse complète"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Catégorie *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={category ? styles.pickerText : styles.pickerPlaceholder}>
                {category || "Sélectionner une catégorie"}
              </Text>
              <MaterialIcons
                name={showCategoryPicker ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
            
            {showCategoryPicker && (
              <View style={styles.categoryPicker}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    onPress={() => {
                      setCategory(cat.name);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <MaterialIcons name={cat.icon as any} size={20} color="#666" />
                    <Text style={styles.categoryText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Prix (€)</Text>
              <TextInput
                style={styles.textInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0 pour gratuit"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Participants max</Text>
              <TextInput
                style={styles.textInput}
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                placeholder="Vide = illimité"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.uploadSection}>
            <Text style={styles.inputLabel}>Image d'événement</Text>
            <TouchableOpacity style={styles.uploadButton}>
              <MaterialIcons name="cloud-upload" size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>Télécharger une image</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateEvent}
          >
            <Text style={styles.createButtonText}>Créer l'événement</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  categoryPicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  uploadSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateEventScreen;
