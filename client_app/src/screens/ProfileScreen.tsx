import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HomeTabs'
>;

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

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, signOut } = useAuth();
  
  const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserEvents();
    }
  }, [user]);

  const loadUserEvents = async () => {
    try {
      setLoading(true);
      const [attendingResponse, createdResponse] = await Promise.all([
        apiService.getUserEvents('attending'),
        apiService.getUserEvents('organized')
      ]);

      if (attendingResponse.success) {
        setAttendingEvents((attendingResponse.data as any).events);
      }

      if (createdResponse.success) {
        setCreatedEvents((createdResponse.data as any).events);
      }
    } catch (error) {
      console.error('Error loading user events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      {item.coverImage && (
        <Image source={{ uri: item.coverImage }} style={styles.eventImage} />
      )}
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.eventDetails}>
          <MaterialIcons name="event" size={14} color="#666" />
          <Text style={styles.eventDate}>
            {formatDate(item.startTime)} • {formatTime(item.startTime)}
          </Text>
        </View>
        <View style={styles.eventLocation}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.eventLocationText} numberOfLines={1}>
            {item.location.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4757" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Utilisateur non connecté</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={80} color="#ccc" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.displayName || user.email}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userJoinedDate}>
              Membre depuis {user.joinedAt ? 
                new Date(user.joinedAt).toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  year: 'numeric' 
                }) : 
                'récemment'
              }
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{attendingEvents.length}</Text>
            <Text style={styles.statLabel}>Participations</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={styles.statValue}>{createdEvents.length}</Text>
            <Text style={styles.statLabel}>Événements créés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Amis</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Modifier le profil</Text>
        </TouchableOpacity>

        {/* Admin access button - for testing purposes, showing for all users */}
        <TouchableOpacity 
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <MaterialIcons name="admin-panel-settings" size={20} color="#fff" />
          <Text style={styles.adminButtonText}>Administration</Text>
        </TouchableOpacity>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mes participations</Text>
          {attendingEvents.length > 0 ? (
            <FlatList
              data={attendingEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Vous ne participez à aucun événement pour le moment.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mes événements créés</Text>
          {createdEvents.length > 0 ? (
            <FlatList
              data={createdEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="add-circle-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Vous n'avez pas encore créé d'événement.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <MaterialIcons name="exit-to-app" size={20} color="#ff4757" />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userJoinedDate: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#ff4757',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  eventsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  eventCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 100,
  },
  eventContent: {
    padding: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 12,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;