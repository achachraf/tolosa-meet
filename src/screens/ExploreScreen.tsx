import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { events, categories } from '../data/mockData';
import Logo from '../components/Logo';

type ExploreScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeTabs'
>;

const ExploreScreen = () => {
  const navigation = useNavigation<ExploreScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const filteredEvents = events.filter((event) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === '' ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected categories
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(event.category);

    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Logo size="medium" withText={true} />
      </View>
      
      <View style={styles.subHeader}>
        <Text style={styles.headerTitle}>Explorer</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un événement, lieu..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filtrer par catégorie:</Text>
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedCategories.includes(item.name) && styles.filterChipSelected,
                ]}
                onPress={() => toggleCategory(item.name)}
              >
                <MaterialIcons
                  name={item.icon as any}
                  size={16}
                  color={selectedCategories.includes(item.name) ? '#fff' : '#333'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategories.includes(item.name) && styles.filterChipTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredEvents.length} événements trouvés
          </Text>
          {(searchQuery !== '' || selectedCategories.length > 0) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategories([]);
              }}
            >
              <Text style={styles.clearFiltersText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            >
              <Image source={{ uri: item.image }} style={styles.eventImage} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetailRow}>
                    <MaterialIcons name="event" size={14} color="#666" />
                    <Text style={styles.eventDetailText}>
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      {' • '}
                      {item.time}
                    </Text>
                  </View>
                  <View style={styles.eventDetailRow}>
                    <MaterialIcons name="location-on" size={14} color="#666" />
                    <Text style={styles.eventDetailText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                </View>
                <View style={styles.eventFooter}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </View>
                  {item.price === 0 ? (
                    <Text style={styles.freeTag}>Gratuit</Text>
                  ) : (
                    <Text style={styles.priceTag}>{item.price}€</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      </View>
      
      <View style={styles.mapButton}>
        <TouchableOpacity style={styles.mapButtonInner}>
          <MaterialIcons name="map" size={24} color="#fff" />
          <Text style={styles.mapButtonText}>Voir sur la carte</Text>
        </TouchableOpacity>
      </View>
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
  subHeader: {
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    marginTop: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filtersList: {
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#ff4757',
  },
  filterChipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearFiltersButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#ff4757',
    fontWeight: '500',
  },
  resultsList: {
    paddingBottom: 80,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: 100,
    height: 100,
  },
  eventContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDetails: {
    flex: 1,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventDetailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  freeTag: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceTag: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mapButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  mapButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4757',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ExploreScreen;