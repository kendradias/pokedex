// components/SearchFilter.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
} from 'react-native';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const getTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };
  return colors[type] || '#888888';
};

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}: SearchFilterProps) {
  const [showTypeModal, setShowTypeModal] = useState(false);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search Pokemon by name..."
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Type Filter Button */}
      <TouchableOpacity
        style={[
          styles.typeFilterButton,
          selectedType && { backgroundColor: getTypeColor(selectedType) }
        ]}
        onPress={() => setShowTypeModal(true)}
      >
        <Text style={[
          styles.typeFilterText,
          selectedType && { color: '#fff' }
        ]}>
          {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'All Types'}
        </Text>
      </TouchableOpacity>

      {/* Clear Filter Button */}
      {(searchQuery || selectedType) && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            onSearchChange('');
            onTypeChange(null);
          }}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      )}

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Pokemon Type</Text>
            
            <ScrollView style={styles.typeList}>
              {/* All Types Option */}
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  !selectedType && styles.selectedTypeOption
                ]}
                onPress={() => {
                  onTypeChange(null);
                  setShowTypeModal(false);
                }}
              >
                <Text style={styles.typeOptionText}>All Types</Text>
              </TouchableOpacity>

              {/* Individual Type Options */}
              {POKEMON_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    { borderLeftColor: getTypeColor(type) },
                    selectedType === type && styles.selectedTypeOption
                  ]}
                  onPress={() => {
                    onTypeChange(type);
                    setShowTypeModal(false);
                  }}
                >
                  <View style={[styles.typeColorIndicator, { backgroundColor: getTypeColor(type) }]} />
                  <Text style={styles.typeOptionText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTypeModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  typeFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  typeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ff4444',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  typeList: {
    maxHeight: 300,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    marginBottom: 4,
    borderRadius: 8,
  },
  selectedTypeOption: {
    backgroundColor: '#F0F0F0',
  },
  typeColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  typeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#f4511e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});