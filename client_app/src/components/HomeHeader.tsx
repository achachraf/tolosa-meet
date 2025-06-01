import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from './Logo';

const HomeHeader: React.FC = () => {
  return (
    <>
      <View style={styles.header}>
        <Logo size="medium" withText={true} />
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.subHeader}>
        <Text style={styles.headerTitle}>Découvrez</Text>
        <Text style={styles.headerSubtitle}>Des événements à Toulouse</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeHeader;
