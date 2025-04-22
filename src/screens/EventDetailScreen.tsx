import React, { useState } from 'react';
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
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { events } from '../data/mockData';
import { RootStackParamList } from '../navigation/AppNavigator';
import MapView from '../components/MapView';

type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

type Props = {
  route: EventDetailScreenRouteProp;
};

const EventDetailScreen = ({ route }: Props) => {
  const { eventId } = route.params;
  const event = events.find((e) => e.id === eventId);
  const [isJoined, setIsJoined] = useState(event?.isJoined || false);

  if (!event) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Événement non trouvé</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi à l'événement "${event.title}" le ${new Date(
          event.date
        ).toLocaleDateString('fr-FR')} à ${event.time} à ${event.location}!`,
        title: event.title,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager l\'événement');
    }
  };

  const handleOpenMaps = () => {
    const address = encodeURIComponent(event.address);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  const handleJoin = () => {
    if (event.maxAttendees && event.attendees >= event.maxAttendees && !isJoined) {
      Alert.alert(
        'Événement complet',
        'Cet événement a atteint sa capacité maximale.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsJoined(!isJoined);
    
    if (!isJoined) {
      Alert.alert(
        'Inscription confirmée',
        `Vous êtes maintenant inscrit à l'événement "${event.title}"`,
        [{ text: 'OK', style: 'default' }]
      );
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: event.image }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.iconButton}>
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
            <Text style={styles.dateText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.timeContainer}>
            <MaterialIcons name="access-time" size={22} color="#ff4757" />
            <Text style={styles.timeText}>{event.time}</Text>
          </View>
        </View>

        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.organizerRow}>
          <MaterialIcons name="group" size={20} color="#666" />
          <Text style={styles.organizerText}>
            Organisé par <Text style={styles.organizerName}>{event.organizer}</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.locationContainer} 
          onPress={handleOpenMaps}
        >
          <View style={styles.locationHeader}>
            <MaterialIcons name="location-on" size={22} color="#ff4757" />
            <Text style={styles.locationName}>{event.location}</Text>
            <MaterialIcons name="navigate-next" size={20} color="#666" />
          </View>
          <Text style={styles.locationAddress}>{event.address}</Text>
        </TouchableOpacity>
        
        <View style={styles.mapContainer}>
          <MapView
            address={event.address}
            markerTitle={event.location}
            showUserLocation={true}
          />
        </View>

        <View style={styles.attendeesContainer}>
          <Text style={styles.attendeesTitle}>Participants</Text>
          <View style={styles.attendeesBadges}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={[styles.attendeeBadge, { zIndex: 5 - i }]}>
                <Text style={styles.attendeeInitial}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
            ))}
            {event.attendees > 5 && (
              <View style={[styles.attendeeBadge, styles.moreAttendeeBadge]}>
                <Text style={styles.moreAttendeesText}>+{event.attendees - 5}</Text>
              </View>
            )}
          </View>
          <Text style={styles.attendeesCount}>
            {event.attendees} {event.maxAttendees ? `sur ${event.maxAttendees}` : ''} participants
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>À propos de cet événement</Text>
          <Text style={styles.detailsText}>{event.description}</Text>
        </View>

        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Prix</Text>
            <Text style={styles.priceValue}>
              {event.price === 0 ? 'Gratuit' : `${event.price}€`}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.joinButton,
              isJoined ? styles.leaveButton : null,
              event.maxAttendees && event.attendees >= event.maxAttendees && !isJoined
                ? styles.disabledButton
                : null,
            ]}
            onPress={handleJoin}
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