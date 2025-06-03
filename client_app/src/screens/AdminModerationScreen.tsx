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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/apiService';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    geoPoint: { latitude: number; longitude: number };
    address: string;
  };
  capacity: number;
  startTime: string;
  endTime: string;
  organizerUid: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  attendeeCount?: number;
  isFlagged?: boolean;
  flagReasons?: string[];
  flaggedBy?: string[];
}

const AdminModerationScreen = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'recent'>('flagged');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllEventsForModeration(filter === 'all' ? undefined : filter);
      
      if (response.success && response.data) {
        const eventsData = (response.data as any).events || [];
        setEvents(eventsData);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les événements pour la modération');
      }
    } catch (error) {
      console.error('Error loading events for moderation:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    } finally {
      setLoading(false);
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
              const response = await apiService.adminDeleteEvent(eventId, 'Supprimé par l\'administrateur');
              if (response.success) {
                setEvents(prev => prev.filter(event => event.id !== eventId));
                setShowEventModal(false);
                Alert.alert('Succès', 'Événement supprimé');
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer l\'événement');
              }
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
      const response = await apiService.unflagEvent(eventId);
      if (response.success) {
        setEvents(prev => prev.map(event =>
          event.id === eventId 
            ? { ...event, isFlagged: false, flagReasons: [], flaggedBy: [] }
            : event
        ));
        setShowEventModal(false);
        Alert.alert('Succès', 'Signalement retiré');
      } else {
        Alert.alert('Erreur', 'Impossible de retirer le signalement');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de retirer le signalement');
    }
  };

  const handleContactOrganizer = (organizerUid: string) => {
    Alert.alert(
      'Contacter l\'organisateur',
      `Souhaitez-vous envoyer un message à l'organisateur ?`,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const EventCard = ({ event }: { event: Event }) => (
    <TouchableOpacity
      style={[styles.eventCard, event.isFlagged && styles.eventCardFlagged]}
      onPress={() => {
        setSelectedEvent(event);
        setShowEventModal(true);
      }}
    >
      {event.coverImage && (
        <Image source={{ uri: event.coverImage }} style={styles.eventImage} />
      )}
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
        
        <Text style={styles.eventOrganizer}>Organisateur: {event.organizerUid}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <MaterialIcons name="event" size={14} color="#666" />
            <Text style={styles.eventDetailText}>
              {formatDate(event.startTime)} à {formatTime(event.startTime)}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <MaterialIcons name="location-on" size={14} color="#666" />
            <Text style={styles.eventDetailText} numberOfLines={1}>
              {event.location.address}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <MaterialIcons name="people" size={14} color="#666" />
            <Text style={styles.eventDetailText}>
              {event.attendeeCount || 0} participant{(event.attendeeCount || 0) > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {event.isFlagged && event.flagReasons && event.flagReasons.length > 0 && (
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
            {selectedEvent.coverImage && (
              <Image source={{ uri: selectedEvent.coverImage }} style={styles.modalEventImage} />
            )}
            
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
                  <Text style={styles.modalDetailText}>Organisé par {selectedEvent.organizerUid}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="event" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>
                    {formatDate(selectedEvent.startTime)} à {formatTime(selectedEvent.startTime)}
                  </Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="location-on" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>{selectedEvent.location.address}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="category" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>{selectedEvent.category}</Text>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <MaterialIcons name="people" size={20} color="#666" />
                  <Text style={styles.modalDetailText}>
                    Capacité: {selectedEvent.capacity} personne{selectedEvent.capacity > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {selectedEvent.isFlagged && selectedEvent.flaggedBy && selectedEvent.flaggedBy.length > 0 && (
                <View style={styles.modalFlagInfo}>
                  <Text style={styles.modalFlagTitle}>Signalements reçus:</Text>
                  <Text style={styles.modalFlagCount}>
                    {selectedEvent.flaggedBy.length} utilisateur{selectedEvent.flaggedBy.length > 1 ? 's ont' : ' a'} signalé cet événement
                  </Text>
                  {selectedEvent.flagReasons && (
                    <View style={styles.modalFlagReasons}>
                      {selectedEvent.flagReasons.map((reason, index) => (
                        <View key={index} style={styles.modalFlagReasonChip}>
                          <Text style={styles.modalFlagReasonText}>{reason}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.contactButton]}
                onPress={() => {
                  setShowEventModal(false);
                  handleContactOrganizer(selectedEvent.organizerUid);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
