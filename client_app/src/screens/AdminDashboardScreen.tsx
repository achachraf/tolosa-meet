import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { apiService } from '../services/apiService';

type AdminDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminDashboard'
>;

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  flaggedEvents: number;
  suspendedUsers: number;
  pendingReports: number;
}

const AdminDashboardScreen = () => {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    flaggedEvents: 0,
    suspendedUsers: 0,
    pendingReports: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardStats = async () => {
    try {
      const response = await apiService.getAdminDashboardStats();
      
      if (response.success && response.data) {
        // The API wraps backend response: { success: true, data: { success: true, stats: {...} } }
        const backendResponse = response.data as { success: boolean; stats: DashboardStats };
        if (backendResponse.success && backendResponse.stats) {
          setStats(backendResponse.stats);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(response.error || 'Failed to load dashboard stats');
      }
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
      
      // Fallback to zero values if API fails
      setStats({
        totalUsers: 0,
        totalEvents: 0,
        flaggedEvents: 0,
        suspendedUsers: 0,
        pendingReports: 0,
      });
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = '#3498db',
    onPress 
  }: {
    title: string;
    value: number;
    icon: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
        <MaterialIcons name={icon as any} size={32} color={color} />
      </View>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    title, 
    subtitle, 
    icon, 
    color = '#3498db', 
    onPress 
  }: {
    title: string;
    subtitle: string;
    icon: string;
    color?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <MaterialIcons name={icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Administration</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Utilisateurs totaux"
              value={stats.totalUsers}
              icon="people"
              color="#3498db"
              onPress={() => navigation.navigate('AdminUsers')}
            />
            <StatCard
              title="Événements totaux"
              value={stats.totalEvents}
              icon="event"
              color="#2ecc71"
              onPress={() => navigation.navigate('AdminModeration')}
            />
            <StatCard
              title="Événements signalés"
              value={stats.flaggedEvents}
              icon="flag"
              color="#e74c3c"
              onPress={() => navigation.navigate('AdminModeration')}
            />
            <StatCard
              title="Utilisateurs suspendus"
              value={stats.suspendedUsers}
              icon="block"
              color="#f39c12"
              onPress={() => navigation.navigate('AdminUsers')}
            />
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <QuickAction
            title="Gestion des utilisateurs"
            subtitle="Promouvoir, suspendre ou gérer les utilisateurs"
            icon="people"
            color="#3498db"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          
          <QuickAction
            title="Modération de contenu"
            subtitle="Examiner les événements signalés"
            icon="flag"
            color="#e74c3c"
            onPress={() => navigation.navigate('AdminModeration')}
          />
          
          <QuickAction
            title="Gestion des catégories"
            subtitle="Ajouter, modifier ou supprimer des catégories"
            icon="category"
            color="#9b59b6"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité sera bientôt disponible')}
          />
          
          <QuickAction
            title="Rapports et analyses"
            subtitle="Statistiques détaillées de l'application"
            icon="assessment"
            color="#f39c12"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité sera bientôt disponible')}
          />
        </View>

        {stats.pendingReports > 0 && (
          <View style={styles.alertSection}>
            <View style={styles.alertCard}>
              <MaterialIcons name="warning" size={24} color="#e74c3c" />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>
                  {stats.pendingReports} signalement{stats.pendingReports > 1 ? 's' : ''} en attente
                </Text>
                <Text style={styles.alertSubtitle}>
                  Des événements nécessitent votre attention
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={() => navigation.navigate('AdminModeration')}
              >
                <Text style={styles.alertButtonText}>Examiner</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    marginRight: 40, // Balance the back button
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginBottom: 24,
  },
  quickAction: {
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
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  alertSection: {
    marginBottom: 24,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  alertButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AdminDashboardScreen;
