import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CategoryItemProps {
  category: {
    slug: string;
    name: string;
    icon: string;
  };
  isActive: boolean;
  onPress: (slug: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, isActive, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.categoryItem, isActive && styles.categoryItemActive]}
      onPress={() => onPress(category.slug)}
    >
      <MaterialIcons 
        name={category.icon as any} 
        size={24} 
        color={isActive ? '#fff' : '#333'} 
      />
      <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryItemActive: {
    backgroundColor: '#ff4757',
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategoryItem;
