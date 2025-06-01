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
  TextInput,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  isSuspended: boolean;
  joinedDate: string;
  eventsCreated: number;
  eventsAttended: number;
}

const AdminUsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'admins' | 'suspended'>('all');

  const loadUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      
      if (response.success && response.data) {
        const backendResponse = response.data as { success: boolean; users: User[] };
        if (backendResponse.success && backendResponse.users) {
          setUsers(backendResponse.users);
          setFilteredUsers(backendResponse.users);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(response.error || 'Failed to load users');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'admins':
        filtered = filtered.filter(user => user.isAdmin);
        break;
      case 'suspended':
        filtered = filtered.filter(user => user.isSuspended);
        break;
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handlePromoteUser = async (userId: string) => {
    Alert.alert(
      'Promouvoir administrateur',
      'Êtes-vous sûr de vouloir promouvoir cet utilisateur en tant qu\'administrateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Promouvoir',
          style: 'default',
          onPress: async () => {
            try {
              const response = await apiService.promoteUserToAdmin(userId);
              
              if (response.success) {
                // Update local state
                setUsers(prev => prev.map(user =>
                  user.id === userId ? { ...user, isAdmin: true } : user
                ));
                Alert.alert('Succès', 'Utilisateur promu administrateur');
              } else {
                throw new Error(response.error || 'Failed to promote user');
              }
            } catch (error: any) {
              console.error('Error promoting user:', error);
              Alert.alert('Erreur', 'Impossible de promouvoir l\'utilisateur');
            }
          }
        }
      ]
    );
  };

  const handleDemoteUser = async (userId: string) => {
    Alert.alert(
      'Rétrograder administrateur',
      'Êtes-vous sûr de vouloir retirer les privilèges administrateur de cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rétrograder',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.demoteUserFromAdmin(userId);
              
              if (response.success) {
                // Update local state
                setUsers(prev => prev.map(user =>
                  user.id === userId ? { ...user, isAdmin: false } : user
                ));
                Alert.alert('Succès', 'Privilèges administrateur retirés');
              } else {
                throw new Error(response.error || 'Failed to demote user');
              }
            } catch (error: any) {
              console.error('Error demoting user:', error);
              Alert.alert('Erreur', 'Impossible de rétrograder l\'utilisateur');
            }
          }
        }
      ]
    );
  };

  const handleSuspendUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const action = user?.isSuspended ? 'réactiver' : 'suspendre';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} l'utilisateur`,
      `Êtes-vous sûr de vouloir ${action} cet utilisateur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: user?.isSuspended ? 'default' : 'destructive',
          onPress: async () => {
            try {
              if (!user?.isSuspended) {
                // Only call suspend API for suspension, not reactivation
                const response = await apiService.suspendUser(userId, 'Suspended by admin');
                
                if (!response.success) {
                  throw new Error(response.error || 'Failed to suspend user');
                }
              }
              
              // Update local state for both suspend and reactivate
              setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, isSuspended: !u.isSuspended } : u
              ));
              Alert.alert('Succès', `Utilisateur ${action}é`);
            } catch (error: any) {
              console.error(`Error ${action}ing user:`, error);
              Alert.alert('Erreur', `Impossible de ${action} l'utilisateur`);
            }
          }
        }
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

  const UserCard = ({ user }: { user: User }) => (
    <TouchableOpacity
      style={[styles.userCard, user.isSuspended && styles.userCardSuspended]}
      onPress={() => {
        setSelectedUser(user);
        setShowUserModal(true);
      }}
    >
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userDate}>Rejoint le {user.joinedDate}</Text>
      </View>
      <View style={styles.badges}>
        {user.isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.badgeText}>Admin</Text>
          </View>
        )}
        {user.isSuspended && (
          <View style={styles.suspendedBadge}>
            <Text style={styles.badgeText}>Suspendu</Text>
          </View>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  const UserModal = () => {
    if (!selectedUser) return null;

    return (
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Text style={styles.modalCancel}>Fermer</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalUserInfo}>
              <Image source={{ uri: selectedUser.avatar }} style={styles.modalAvatar} />
              <Text style={styles.modalUserName}>{selectedUser.name}</Text>
              <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
              
              <View style={styles.modalBadges}>
                {selectedUser.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.badgeText}>Administrateur</Text>
                  </View>
                )}
                {selectedUser.isSuspended && (
                  <View style={styles.suspendedBadge}>
                    <Text style={styles.badgeText}>Suspendu</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              {!selectedUser.isAdmin ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.promoteButton]}
                  onPress={() => {
                    setShowUserModal(false);
                    handlePromoteUser(selectedUser.id);
                  }}
                >
                  <MaterialIcons name="arrow-upward" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Promouvoir Admin</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.demoteButton]}
                  onPress={() => {
                    setShowUserModal(false);
                    handleDemoteUser(selectedUser.id);
                  }}
                >
                  <MaterialIcons name="arrow-downward" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Rétrograder</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  selectedUser.isSuspended ? styles.activateButton : styles.suspendButton
                ]}
                onPress={() => {
                  setShowUserModal(false);
                  handleSuspendUser(selectedUser.id);
                }}
              >
                <MaterialIcons
                  name={selectedUser.isSuspended ? "check" : "block"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>
                  {selectedUser.isSuspended ? 'Réactiver' : 'Suspendre'}
                </Text>
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
        <Text style={styles.headerTitle}>Gestion des utilisateurs</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersContainer}>
        <FilterChip
          title="Tous"
          isActive={filter === 'all'}
          onPress={() => setFilter('all')}
          count={users.length}
        />
        <FilterChip
          title="Admins"
          isActive={filter === 'admins'}
          onPress={() => setFilter('admins')}
          count={users.filter(u => u.isAdmin).length}
        />
        <FilterChip
          title="Suspendus"
          isActive={filter === 'suspended'}
          onPress={() => setFilter('suspended')}
          count={users.filter(u => u.isSuspended).length}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserCard user={item} />}
        contentContainerStyle={styles.usersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Aucun utilisateur trouvé</Text>
          </View>
        }
      />

      <UserModal />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  usersList: {
    paddingHorizontal: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userCardSuspended: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  badges: {
    gap: 4,
  },
  adminBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suspendedBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
  },
  modalUserInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  modalUserName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
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
    gap: 8,
  },
  promoteButton: {
    backgroundColor: '#2ecc71',
  },
  demoteButton: {
    backgroundColor: '#f39c12',
  },
  suspendButton: {
    backgroundColor: '#e74c3c',
  },
  activateButton: {
    backgroundColor: '#27ae60',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AdminUsersScreen;
