import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation/types';
import MapView from '../components/MapView';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

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
}

type Props = {
  route: EventDetailScreenRouteProp;
};

const EventDetailScreen = ({ route }: Props) => {
  const { eventId } = route.params;
  const navigation = useNavigation();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const [eventResponse, attendeesResponse] = await Promise.all([
        apiService.getEvent(eventId),
        apiService.getEventAttendees(eventId)
      ]);

      if (eventResponse.success) {
        setEvent((eventResponse.data as any).event);
      }

      if (attendeesResponse.success) {
        const attendees = (attendeesResponse.data as any).attendees;
        setAttendeeCount(attendees.length);
        setIsJoined(attendees.some((attendee: any) => attendee.uid === user?.uid));
      }
    } catch (error) {
      console.error('Error loading event details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4757" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Événement non trouvé</Text>
      </View>
    );
  }

  const handleShare = async () => {
    if (!event) return;
    
    try {
      const eventDate = new Date(event.startTime).toLocaleDateString('fr-FR');
      const eventTime = new Date(event.startTime).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      await Share.share({
        message: `Rejoins-moi à l'événement "${event.title}" le ${eventDate} à ${eventTime} à ${event.location.address}!`,
        title: event.title,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager l\'événement');
    }
  };

  const handleOpenMaps = () => {
    if (!event) return;
    
    const address = encodeURIComponent(event.location.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  const handleJoin = async () => {
    if (!event || !user) return;

    if (event.capacity > 0 && attendeeCount >= event.capacity && !isJoined) {
      Alert.alert(
        'Événement complet',
        'Cet événement a atteint sa capacité maximale.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      const response = isJoined 
        ? await apiService.leaveEvent(event.id)
        : await apiService.joinEvent(event.id);

      if (response.success) {
        setIsJoined(!isJoined);
        setAttendeeCount(prev => isJoined ? prev - 1 : prev + 1);
        
        if (!isJoined) {
          Alert.alert(
            'Inscription confirmée',
            `Vous êtes maintenant inscrit à l'événement "${event.title}"`,
            [{ text: 'OK', style: 'default' }]
          );
        }
      } else {
        Alert.alert('Erreur', 'Impossible de modifier votre inscription');
      }
    } catch (error) {
      console.error('Error joining/leaving event:', error);
      Alert.alert('Erreur', 'Impossible de modifier votre inscription');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!event) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Événement non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {event.coverImage && (
          <Image source={{ uri: event.coverImage }} style={styles.image} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.backButtonContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <MaterialIcons name="share" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateContainer}>
            <MaterialIcons name="event" size={22} color="#ff4757" />
            <Text style={styles.dateText}>{formatDate(event.startTime)}</Text>
          </View>
          <View style={styles.timeContainer}>
            <MaterialIcons name="access-time" size={22} color="#ff4757" />
            <Text style={styles.timeText}>{formatTime(event.startTime)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.organizerRow}>
          <MaterialIcons name="group" size={20} color="#666" />
          <Text style={styles.organizerText}>
            Organisé par <Text style={styles.organizerName}>Organisateur</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.locationContainer} 
          onPress={handleOpenMaps}
        >
          <View style={styles.locationHeader}>
            <MaterialIcons name="location-on" size={22} color="#ff4757" />
            <Text style={styles.locationName}>Lieu</Text>
            <MaterialIcons name="navigate-next" size={20} color="#666" />
          </View>
          <Text style={styles.locationAddress}>{event.location.address}</Text>
        </TouchableOpacity>
        
        <View style={styles.mapContainer}>
          <MapView
            address={event.location.address}
            markerTitle="Lieu de l'événement"
            showUserLocation={true}
            latitude={event.location.geoPoint.latitude}
            longitude={event.location.geoPoint.longitude}
          />
        </View>

        <View style={styles.attendeesContainer}>
          <Text style={styles.attendeesTitle}>Participants</Text>
          <View style={styles.attendeesBadges}>
            {[...Array(Math.min(5, attendeeCount))].map((_, i) => (
              <View key={i} style={[styles.attendeeBadge, { zIndex: 5 - i }]}>
                <Text style={styles.attendeeInitial}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
            ))}
            {attendeeCount > 5 && (
              <View style={[styles.attendeeBadge, styles.moreAttendeeBadge]}>
                <Text style={styles.moreAttendeesText}>+{attendeeCount - 5}</Text>
              </View>
            )}
          </View>
          <Text style={styles.attendeesCount}>
            {attendeeCount} {event.capacity > 0 ? `sur ${event.capacity}` : ''} participants
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>À propos de cet événement</Text>
          <Text style={styles.detailsText}>{event.description}</Text>
        </View>

        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Prix</Text>
            <Text style={styles.priceValue}>Gratuit</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined ? styles.leaveButton : null,
              event.capacity > 0 && attendeeCount >= event.capacity && !isJoined
                ? styles.disabledButton
                : null,
            ]}
            onPress={handleJoin}
            disabled={event.capacity > 0 && attendeeCount >= event.capacity && !isJoined}
          >
            <Text style={[
              styles.joinButtonText,
              isJoined ? styles.leaveButtonText : null,
            ]}>
              {isJoined ? 'Annuler' : 'S\'inscrire'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  contentContainer: {
    padding: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  organizerName: {
    fontWeight: '600',
    color: '#333',
  },
  locationContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginLeft: 26,
    marginTop: 2,
  },
  mapContainer: {
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  attendeesContainer: {
    marginBottom: 16,
  },
  attendeesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  attendeesBadges: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  attendeeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ff4757',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  attendeeInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  moreAttendeeBadge: {
    backgroundColor: '#3498db',
  },
  moreAttendeesText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  attendeesCount: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  joinButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leaveButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  leaveButtonText: {
    color: '#ff4757',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default EventDetailScreen;