import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  address: string;
  category: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  price: number;
  isFlagged: boolean;
  flagReasons: string[];
  flaggedBy: string[];
  createdAt: string;
}

const AdminModerationScreen = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'recent'>('flagged');

  const loadEvents = async () => {
    try {
      // In a real app, this would fetch from your admin API
      // For now, using mock data
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Concert de Jazz au Capitole',
          description: 'Venez découvrir les meilleurs artistes de jazz de Toulouse dans un cadre exceptionnel.',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
          date: '2024-02-15',
          time: '20:00',
          location: 'Théâtre du Capitole',
          address: 'Place du Capitole, 31000 Toulouse',
          category: 'Musique',
          organizer: 'Marie Martin',
          attendees: 45,
          maxAttendees: 200,
          price: 25,
          isFlagged: true,
          flagReasons: ['Contenu inapproprié', 'Prix suspect'],
          flaggedBy: ['user123', 'user456'],
          createdAt: '2024-01-20',
        },
        {
          id: '2',
          title: 'Randonnée dans les Pyrénées',
          description: 'Une magnifique randonnée d\'une journée dans les montagnes.',
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500',
          date: '2024-02-20',
          time: '08:00',
          location: 'Départ parking Blagnac',
          address: 'Parking de Blagnac, 31700 Blagnac',
          category: 'Sport',
          organizer: 'Pierre Leclerc',
          attendees: 12,
          maxAttendees: 20,
          price: 0,
          isFlagged: true,
          flagReasons: ['Localisation douteuse'],
          flaggedBy: ['user789'],
          createdAt: '2024-01-25',
        },
        {
          id: '3',
          title: 'Atelier cuisine végétarienne',
          description: 'Apprenez à cuisiner de délicieux plats végétariens avec un chef professionnel.',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
          date: '2024-02-18',
          time: '14:00',
          location: 'École de cuisine Le Gourmand',
          address: 'Rue de la République, 31000 Toulouse',
          category: 'Gastronomie',
          organizer: 'Sophie Bernard',
          attendees: 8,
          maxAttendees: 15,
          price: 35,
          isFlagged: false,
          flagReasons: [],
          flaggedBy: [],
          createdAt: '2024-01-28',
        },
      ];
      setEvents(mockEvents);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les événements');
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    switch (filter) {
      case 'flagged':
        filtered = events.filter(event => event.isFlagged);
        break;
      case 'recent':
        filtered = events.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 10);
        break;
      case 'all':
      default:
        filtered = events;
        break;
    }

    setFilteredEvents(filtered);
  }, [events, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer définitivement cet événement ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, call your admin API
              setEvents(prev => prev.filter(event => event.id !== eventId));
              setShowEventModal(false);
              Alert.alert('Succès', 'Événement supprimé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
            }
          }
        }
      ]
    );
  };

  const handleUnflagEvent = async (eventId: string) => {
    try {
      // In a real app, call your admin API
      setEvents(prev => prev.map(event =>
        event.id === eventId 
          ? { ...event, isFlagged: false, flagReasons: [], flaggedBy: [] }
          : event
      ));
      setShowEventModal(false);
      Alert.alert('Succès', 'Signalement retiré');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de retirer le signalement');
    }
  };

  const handleContactOrganizer = (organizer: string) => {
    Alert.alert(
      'Contacter l\'organisateur',
      `Souhaitez-vous envoyer un message à ${organizer} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: () => {
          Alert.alert('Message envoyé', 'L\'organisateur a été contacté.');
        }}
      ]
    );
  };

  const FilterChip = ({ 
    title, 
    isActive, 
    onPress, 
    count 
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
    count?: number;
  }) => (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {title} {count !== undefined ? `(${count})` : ''}
      </Text>
    </TouchableOpacity>
  );

  const EventCard = ({ event }: { event: Event }) => (
    <TouchableOpacity
      style={[styles.eventCard, event.isFlagged && styles.eventCardFlagged]}
      onPress={() => {
        setSelectedEvent(event);
        setShowEventModal(true);
      }}
    >
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          {event.isFlagged && (
            <View style={styles.flaggedBadge}>
              <MaterialIcons name="flag" size={12} color="#fff" />
              <Text style={styles.flaggedBadgeText}>Signalé</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.eventOrganizer}>Par {event.organizer}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <MaterialIcons name="event" size={14} color="#666" />
            <Text style={styles.eventDetailText}>
              {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <MaterialIcons name="location-on" size={14} color="#666" />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <MaterialIcons name="people" size={14} color="#666" />
            <Text style={styles.eventDetailText}>
              {event.attendees} participant{event.attendees > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {event.isFlagged && event.flagReasons.length > 0 && (
          <View style={styles.flagReasons}>
            <Text style={styles.flagReasonsTitle}>Raisons du signalement:</Text>
            {event.flagReasons.map((reason, index) => (
              <Text key={index} style={styles.flagReason}>• {reason}</Text>
            ))}
          </View>
        )}
      </View>
      
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  const EventModal = () => {
    if (!selectedEvent) return null;

    return (
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Text style={styles.modalCancel}>Fermer</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Modération événement</Text>
            <View style={styles.modalSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Image source={{ uri: selectedEvent.image }} style={styles.modalEventImage} />
            
            <View style={styles.modalEventInfo}>
              <View style={styles.modalEventHeader}>
                <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>
                {selectedEvent.isFlagged && (
                  <View style={styles.flaggedBadge}>
                    <MaterialIcons name="flag" size={16} color="#fff" />
                    <Text style={styles.flaggedBadgeText}>Signalé</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.modalEventDescription}>{selectedEvent.description}</Text>
              
              <View style={styles.modalEventDetails}>
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="person" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>Organisé par {selectedEvent.organizer}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="event" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>
                    {new Date(selectedEvent.date).toLocaleDateString('fr-FR')} à {selectedEvent.time}
                  </Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="location-on" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>{selectedEvent.location}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="category" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>{selectedEvent.category}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="euro" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>
                    {selectedEvent.price === 0 ? 'Gratuit' : `${selectedEvent.price}€`}
                  </Text>
                </View>
              </View>

              {selectedEvent.isFlagged && (
                <View style={styles.modalFlagInfo}>
                  <Text style={styles.modalFlagTitle}>Signalements reçus:</Text>
                  <Text style={styles.modalFlagCount}>
                    {selectedEvent.flaggedBy.length} utilisateur{selectedEvent.flaggedBy.length > 1 ? 's ont' : ' a'} signalé cet événement
                  </Text>
                  <View style={styles.modalFlagReasons}>
                    {selectedEvent.flagReasons.map((reason, index) => (
                      <View key={index} style={styles.modalFlagReasonChip}>
                        <Text style={styles.modalFlagReasonText}>{reason}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.contactButton]}
                onPress={() => {
                  setShowEventModal(false);
                  handleContactOrganizer(selectedEvent.organizer);
                }}
              >
                <MaterialIcons name="message" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Contacter l'organisateur</Text>
              </TouchableOpacity>

              {selectedEvent.isFlagged && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.unflagButton]}
                  onPress={() => handleUnflagEvent(selectedEvent.id)}
                >
                  <MaterialIcons name="flag" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Retirer le signalement</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteEvent(selectedEvent.id)}
              >
                <MaterialIcons name="delete" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Supprimer l'événement</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modération de contenu</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filtersContainer}>
        <FilterChip
          title="Signalés"
          isActive={filter === 'flagged'}
          onPress={() => setFilter('flagged')}
          count={events.filter(e => e.isFlagged).length}
        />
        <FilterChip
          title="Récents"
          isActive={filter === 'recent'}
          onPress={() => setFilter('recent')}
        />
        <FilterChip
          title="Tous"
          isActive={filter === 'all'}
          onPress={() => setFilter('all')}
          count={events.length}
        />
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        style={styles.eventsList}
        contentContainerStyle={styles.eventsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {filter === 'flagged' 
                ? 'Aucun événement signalé' 
                : 'Aucun événement trouvé'
              }
            </Text>
          </View>
        }
      />

      <EventModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#ff4757',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventCardFlagged: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flaggedBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  eventOrganizer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventDetails: {
    marginBottom: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  flagReasons: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  flagReasonsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  flagReason: {
    fontSize: 11,
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    fontSize: 16,
    color: '#ff4757',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    flex: 1,
  },
  modalEventImage: {
    width: '100%',
    height: 200,
  },
  modalEventInfo: {
    padding: 16,
    backgroundColor: '#fff',
  },
  modalEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalEventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  modalEventDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  modalEventDetails: {
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  modalFlagInfo: {
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  modalFlagTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  modalFlagCount: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
  },
  modalFlagReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  modalFlagReasonChip: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modalFlagReasonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButton: {
    backgroundColor: '#3498db',
  },
  unflagButton: {
    backgroundColor: '#2ecc71',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AdminModerationScreen;
