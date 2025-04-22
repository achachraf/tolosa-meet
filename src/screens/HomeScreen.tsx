import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { events, categories, Event, Category } from '../data/mockData';
import { RootStackParamList } from '../navigation/AppNavigator';
import Logo from '../components/Logo';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeTabs'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(event => event.category.toLowerCase() === activeCategory.toLowerCase());
    
  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>{new Date(item.date).getDate()}</Text>
        <Text style={styles.eventDateMonth}>
          {new Date(item.date).toLocaleString('fr-FR', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.eventLocationRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.eventLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        <View style={styles.eventDetailsRow}>
          <View style={styles.eventTimeContainer}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.eventTime}>{item.time}</Text>
          </View>
          <View style={styles.eventAttendeeContainer}>
            <MaterialIcons name="people" size={14} color="#666" />
            <Text style={styles.eventAttendees}>
              {item.attendees}{item.maxAttendees ? `/${item.maxAttendees}` : ''}
            </Text>
          </View>
          {item.price === 0 ? (
            <Text style={styles.freeTag}>Gratuit</Text>
          ) : (
            <Text style={styles.priceTag}>{item.price}€</Text>
          )}
        </View>
      </View>
      {item.isJoined && (
        <View style={styles.joinedBadge}>
          <MaterialIcons name="check" size={12} color="#fff" />
          <Text style={styles.joinedText}>Inscrit</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        item.name.toLowerCase() === activeCategory.toLowerCase() && styles.categoryItemActive
      ]}
      onPress={() => setActiveCategory(item.name.toLowerCase())}
    >
      <MaterialIcons 
        name={item.icon as any} 
        size={24} 
        color={item.name.toLowerCase() === activeCategory.toLowerCase() ? '#fff' : '#333'} 
      />
      <Text 
        style={[
          styles.categoryText,
          item.name.toLowerCase() === activeCategory.toLowerCase() && styles.categoryTextActive
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  const renderFeaturedEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.featuredEventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.featuredEventImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredEventGradient}
      >
        <View style={styles.featuredEventContent}>
          <Text style={styles.featuredEventTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.featuredEventDetails}>
            <View style={styles.eventLocationRow}>
              <MaterialIcons name="location-on" size={16} color="#fff" />
              <Text style={styles.featuredEventLocation} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={styles.featuredEventBottomRow}>
              <View style={styles.featuredEventDate}>
                <MaterialIcons name="event" size={16} color="#fff" />
                <Text style={styles.featuredEventDateText}>
                  {new Date(item.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </Text>
              </View>
              {item.price === 0 ? (
                <Text style={styles.featuredFreeTag}>Gratuit</Text>
              ) : null}
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Get upcoming events for featured section
  const featuredEvents = events
    .filter(event => new Date(event.date) > new Date())
    .slice(0, 3);
    
  // All categories + "All" option
  const allCategories = [{ id: 'all', name: 'Tous', icon: 'apps' }, ...categories];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Logo size="medium" withText={true} />
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.subHeader}>
        <Text style={styles.headerTitle}>Découvrez</Text>
        <Text style={styles.headerSubtitle}>Des événements à Toulouse</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Événements à venir</Text>
          <FlatList
            data={featuredEvents}
            renderItem={renderFeaturedEvent}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>
        
        <View style={styles.categoriesSection}>
          <FlatList
            data={allCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'all' ? 'Tous les événements' : `Événements ${activeCategory}`}
            </Text>
            <Text style={styles.sectionSubtitle}>{filteredEvents.length} trouvés</Text>
          </View>
          <FlatList
            data={filteredEvents}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  featuredSection: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  featuredList: {
    paddingBottom: 10,
  },
  featuredEventCard: {
    width: 300,
    height: 180,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuredEventImage: {
    width: '100%',
    height: '100%',
  },
  featuredEventGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  featuredEventContent: {},
  featuredEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  featuredEventDetails: {},
  featuredEventLocation: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  featuredEventBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  featuredEventDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredEventDateText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  featuredFreeTag: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesSection: {
    marginTop: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryItemActive: {
    backgroundColor: '#ff4757',
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventsSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  eventsList: {},
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventDateBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  eventDateMonth: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  eventContent: {
    padding: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventLocation: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  eventTime: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  eventAttendeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAttendees: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  freeTag: {
    marginLeft: 'auto',
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceTag: {
    marginLeft: 'auto',
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  joinedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default HomeScreen;