import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useEvents, useCategories, useUserEvents, Event } from '../hooks/useHomeData';
import { isUpcomingEvent } from '../utils/dateUtils';
import EventCard from '../components/EventCard';
import FeaturedEventCard from '../components/FeaturedEventCard';
import CategoryItem from '../components/CategoryItem';
import HomeHeader from '../components/HomeHeader';

const HomeScreen = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { events, loading, setLoading, loadEvents } = useEvents(activeCategory);
  const { categories, loadCategories } = useCategories();
  const { userEvents, loadUserEvents } = useUserEvents();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadCategories(),
      loadEvents(),
      loadUserEvents()
    ]);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const handleCategoryPress = (slug: string) => {
    setActiveCategory(slug);
  };

  // Get upcoming events for featured section
  const featuredEvents = events
    .filter(event => isUpcomingEvent(event.startTime))
    .slice(0, 3);
    
  // Filter events based on category
  const filteredEvents = activeCategory === 'all' 
    ? events 
    : events.filter(event => event.category === activeCategory);
    
  // All categories + "All" option
  const allCategories = [
    { slug: 'all', name: 'Tous', icon: 'apps' }, 
    ...categories.map(cat => ({ 
      slug: cat.slug, 
      name: cat.nameFr, 
      icon: 'category' 
    }))
  ];

  const renderEventCard = ({ item }: { item: Event }) => (
    <EventCard 
      event={item} 
      isJoined={userEvents.includes(item.id)} 
    />
  );

  const renderFeaturedEvent = ({ item }: { item: Event }) => (
    <FeaturedEventCard event={item} />
  );

  const renderCategoryItem = ({ item }: { item: { slug: string; name: string; icon: string } }) => (
    <CategoryItem 
      category={item}
      isActive={item.slug === activeCategory}
      onPress={handleCategoryPress}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <HomeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4757" />
          <Text style={styles.loadingText}>Chargement des événements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <HomeHeader />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <FeaturedSection 
          events={featuredEvents}
          renderItem={renderFeaturedEvent}
        />
        
        <CategoriesSection 
          categories={allCategories}
          renderItem={renderCategoryItem}
        />
        
        <EventsSection 
          activeCategory={activeCategory}
          events={filteredEvents}
          renderItem={renderEventCard}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Separate section components for better organization
const FeaturedSection: React.FC<{
  events: Event[];
  renderItem: ({ item }: { item: Event }) => React.ReactElement;
}> = ({ events, renderItem }) => (
  <View style={styles.featuredSection}>
    <Text style={styles.sectionTitle}>Événements à venir</Text>
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.featuredList}
    />
  </View>
);

const CategoriesSection: React.FC<{
  categories: Array<{ slug: string; name: string; icon: string }>;
  renderItem: ({ item }: { item: { slug: string; name: string; icon: string } }) => React.ReactElement;
}> = ({ categories, renderItem }) => (
  <View style={styles.categoriesSection}>
    <FlatList
      data={categories}
      renderItem={renderItem}
      keyExtractor={(item) => item.slug}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesList}
    />
  </View>
);

const EventsSection: React.FC<{
  activeCategory: string;
  events: Event[];
  renderItem: ({ item }: { item: Event }) => React.ReactElement;
}> = ({ activeCategory, events, renderItem }) => (
  <View style={styles.eventsSection}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {activeCategory === 'all' ? 'Tous les événements' : `Événements ${activeCategory}`}
      </Text>
      <Text style={styles.sectionSubtitle}>{events.length} trouvés</Text>
    </View>
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      contentContainerStyle={styles.eventsList}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  categoriesSection: {
    marginTop: 10,
  },
  categoriesList: {
    paddingHorizontal: 16,
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
});

export default HomeScreen;