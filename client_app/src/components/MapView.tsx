import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// In a real app, we would use react-native-maps
// This is a placeholder component that simulates a map view
const MapView = ({ 
  address = '', 
  markerTitle = '', 
  showUserLocation = true,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // In a real app with react-native-maps, we would get the location
        // and center the map on it
        setLoading(false);
      } catch (error) {
        setErrorMsg('Could not access location services');
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={32} color="#ff4757" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <View style={styles.mockMap}>
            <MaterialIcons name="map" size={48} color="#8e8e8e" />
            <Text style={styles.mockMapText}>Carte de Toulouse</Text>
            <Text style={styles.addressText}>{address}</Text>
            <View style={styles.markerContainer}>
              <MaterialIcons name="location-on" size={32} color="#ff4757" />
              <Text style={styles.markerTitle}>{markerTitle}</Text>
            </View>
            {showUserLocation && (
              <View style={styles.userLocationContainer}>
                <MaterialIcons name="my-location" size={24} color="#3498db" />
                <Text style={styles.userLocationText}>Votre position</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.directionsButton}>
            <MaterialIcons name="directions" size={20} color="#fff" />
            <Text style={styles.directionsText}>Itinéraire</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mockMapText: {
    fontSize: 16,
    color: '#8e8e8e',
    fontWeight: '500',
    marginTop: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    left: Dimensions.get('window').width / 2 - 20,
    top: 80,
  },
  markerTitle: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  userLocationContainer: {
    position: 'absolute',
    alignItems: 'center',
    right: 40,
    bottom: 40,
  },
  userLocationText: {
    fontSize: 10,
    color: '#3498db',
  },
  directionsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ff4757',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  directionsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default MapView;