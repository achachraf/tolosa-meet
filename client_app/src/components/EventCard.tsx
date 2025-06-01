import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Event } from '../hooks/useHomeData';
import { formatDate } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeTabs'>;

interface EventCardProps {
  event: Event;
  isJoined: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, isJoined }) => {
  const navigation = useNavigation<NavigationProp>();
  const dateInfo = formatDate(event.startTime);

  return (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      {event.coverImage && (
        <Image source={{ uri: event.coverImage }} style={styles.eventImage} />
      )}
      
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>{dateInfo.day}</Text>
        <Text style={styles.eventDateMonth}>{dateInfo.month}</Text>
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
        
        <View style={styles.eventLocationRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.eventLocation} numberOfLines={1}>
            {event.location.address}
          </Text>
        </View>
        
        <View style={styles.eventDetailsRow}>
          <View style={styles.eventTimeContainer}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.eventTime}>{dateInfo.time}</Text>
          </View>
          
          <View style={styles.eventAttendeeContainer}>
            <MaterialIcons name="people" size={14} color="#666" />
            <Text style={styles.eventAttendees}>
              {event.capacity === 0 ? 'Illimité' : `${event.capacity} places`}
            </Text>
          </View>
          
          <Text style={styles.freeTag}>Gratuit</Text>
        </View>
      </View>
      
      {isJoined && (
        <View style={styles.joinedBadge}>
          <MaterialIcons name="check" size={12} color="#fff" />
          <Text style={styles.joinedText}>Inscrit</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default EventCard;
