import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

interface CustomMapViewProps {
  address?: string;
  markerTitle?: string;
  showUserLocation?: boolean;
  latitude?: number;
  longitude?: number;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({ 
  address = '', 
  markerTitle = '', 
  showUserLocation = true,
  latitude,
  longitude,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        if (showUserLocation) {
          try {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          } catch (error) {
            console.log('Could not get user location:', error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        setErrorMsg('Could not access location services');
        setLoading(false);
      }
    })();
  }, [showUserLocation]);

  // Default to Toulouse city center if no coordinates provided
  const defaultLatitude = 43.6047;
  const defaultLongitude = 1.4442;
  
  const mapLatitude = latitude || defaultLatitude;
  const mapLongitude = longitude || defaultLongitude;

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mapLatitude},${mapLongitude}`;
    Linking.openURL(url);
  };

  const generateMapHTML = () => {
    const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      console.warn('Google Maps API key not found in environment variables');
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; }
            html, body, #map { height: 100%; width: 100%; }
            .error { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100%; 
              font-family: Arial, sans-serif; 
              color: #666;
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <div id="error" class="error" style="display: none;">
            📍 Carte indisponible<br/>
            <small>Latitude: ${mapLatitude}<br/>Longitude: ${mapLongitude}</small>
          </div>
          <script>
            function initMap() {
              try {
                const location = {lat: ${mapLatitude}, lng: ${mapLongitude}};
                const map = new google.maps.Map(document.getElementById("map"), {
                  zoom: 15,
                  center: location,
                  disableDefaultUI: true,
                  gestureHandling: 'greedy',
                  styles: [
                    {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [{ visibility: "off" }]
                    }
                  ]
                });
                const marker = new google.maps.Marker({
                  position: location,
                  map: map,
                  title: "${markerTitle.replace(/"/g, '\\"')}",
                  icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23ff4757"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'),
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20, 40)
                  }
                });
              } catch (error) {
                console.error('Map error:', error);
                document.getElementById('map').style.display = 'none';
                document.getElementById('error').style.display = 'flex';
              }
            }
            
            function onMapError() {
              document.getElementById('map').style.display = 'none';
              document.getElementById('error').style.display = 'flex';
            }
            
            window.addEventListener('error', onMapError);
          </script>
          <script async defer 
            src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap&libraries=geometry"
            onerror="onMapError()">
          </script>
        </body>
      </html>
    `;
  };

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
          <WebView
            source={{ html: generateMapHTML() }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            scrollEnabled={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView HTTP error: ', nativeEvent);
            }}
            renderError={(errorName) => (
              <View style={styles.errorContainer}>
                <MaterialIcons name="map" size={32} color="#666" />
                <Text style={styles.errorText}>Carte temporairement indisponible</Text>
                <Text style={styles.locationText}>
                  📍 {address || `${mapLatitude.toFixed(4)}, ${mapLongitude.toFixed(4)}`}
                </Text>
              </View>
            )}
          />
          
          <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
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
  map: {
    width: '100%',
    height: '100%',
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
  locationText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CustomMapView;