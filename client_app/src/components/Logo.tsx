import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', withText = true }) => {
  // Determine dimensions based on size
  const dimensions = {
    small: { width: 30, height: 30, fontSize: 14 },
    medium: { width: 40, height: 40, fontSize: 16 },
    large: { width: 60, height: 60, fontSize: 20 },
  };

  const { width, height, fontSize } = dimensions[size];

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width, height }]}>
        <LinearGradient
          colors={['#ff4757', '#ff6b81']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoText}>H</Text>
        </LinearGradient>
      </View>
      
      {withText && (
        <Text style={[styles.brandText, { fontSize }]}>
          <Text style={styles.happyText}>Happy</Text>
          <Text style={styles.tolosaText}> Tolosa</Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 6,
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  brandText: {
    fontWeight: 'bold',
  },
  happyText: {
    color: '#ff4757',
  },
  tolosaText: {
    color: '#333',
  },
});

export default Logo;