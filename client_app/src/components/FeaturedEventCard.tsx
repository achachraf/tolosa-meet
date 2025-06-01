import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Event } from '../hooks/useHomeData';
import { formatDateForFeatured } from '../utils/dateUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeTabs'>;

interface FeaturedEventCardProps {
  event: Event;
}

const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <TouchableOpacity 
      style={styles.featuredEventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      {event.coverImage && (
        <Image source={{ uri: event.coverImage }} style={styles.featuredEventImage} />
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.featuredEventGradient}
      >
        <View style={styles.featuredEventContent}>
          <Text style={styles.featuredEventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          
          <View style={styles.featuredEventDetails}>
            <View style={styles.eventLocationRow}>
              <MaterialIcons name="location-on" size={16} color="#fff" />
              <Text style={styles.featuredEventLocation} numberOfLines={1}>
                {event.location.address}
              </Text>
            </View>
            
            <View style={styles.featuredEventBottomRow}>
              <View style={styles.featuredEventDate}>
                <MaterialIcons name="event" size={16} color="#fff" />
                <Text style={styles.featuredEventDateText}>
                  {formatDateForFeatured(event.startTime)}
                </Text>
              </View>
              <Text style={styles.featuredFreeTag}>Gratuit</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
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
});

export default FeaturedEventCard;
