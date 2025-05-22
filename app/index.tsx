// app/index.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView,
  RefreshControl,
  TextInput
} from 'react-native';
import { getPokemonList, searchPokemon } from '../utils/api';
import { PokemonListResponse, Result } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';

export default function HomePage() {
  const [pokemonData, setPokemonData] = useState<PokemonListResponse | null>(null);
  const [allPokemon, setAllPokemon] = useState<Result[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Result[]>([]);
  const [pokemonWithTypes, setPokemonWithTypes] = useState<{[key: string]: string[]}>({});

  // Function to fetch Pokemon data
  const fetchPokemon = async (url = "") => {
    try {
      setError(null);
      const data = await getPokemonList(url);
      setPokemonData(data);
      
      if (!url) {
        setAllPokemon(data.results);
      } else {
        setAllPokemon(prev => [...prev, ...data.results]);
      }
    } catch (err) {
      setError('Failed to fetch Pokemon data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      const results = await searchPokemon(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  const storePokemonTypes = (pokemonName: string, types: string[]) => {
    setPokemonWithTypes(prev => ({
      ...prev,
      [pokemonName]: types
    }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setAllPokemon([]);
    setPokemonWithTypes({});
    setSearchQuery('');
    setSearchResults([]);
    fetchPokemon();
  };

  const handleLoadMore = async () => {
    // Don't load more if we're searching or already loading
    if (loadingMore || !pokemonData || !pokemonData.next || searchQuery.trim()) return;
    
    try {
      setLoadingMore(true);
      const newData = await getPokemonList(pokemonData.next);
      
      setPokemonData({
        ...newData,
        results: [...pokemonData.results, ...newData.results],
      });
      
      setAllPokemon(prev => [...prev, ...newData.results]);
    } catch (err) {
      console.error('Error loading more Pokemon:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Determine which Pokemon list to show
  const displayedPokemon = searchQuery.trim() ? searchResults : allPokemon;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>Loading Pokémon...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderFooter = () => {
    if (searchQuery.trim()) {
      // Show search loading indicator
      return searching ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#f4511e" />
          <Text style={styles.footerText}>Searching...</Text>
        </View>
      ) : null;
    }

    // Show infinite scroll loading indicator
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#f4511e" />
        <Text style={styles.footerText}>Loading more Pokémon...</Text>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.trim() && !searching && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No Pokémon found for "{searchQuery}"
          </Text>
          <Text style={styles.emptySubtext}>
            Try a different search term.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Pokemon by name..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      <View style={styles.countContainer}>
        <Text style={styles.totalCount}>
          {searchQuery.trim() 
            ? `Found ${searchResults.length} Pokémon` 
            : `Total Pokémon: ${pokemonData?.count || 0}`
          }
        </Text>
        {searchQuery.trim() && (
          <Text style={styles.filterInfo}>
            Search: "{searchQuery}"
          </Text>
        )}
      </View>
      
      <FlatList
        data={displayedPokemon}
        renderItem={({ item }) => (
          <PokemonCard 
            pokemon={item} 
            onTypesLoaded={(types) => storePokemonTypes(item.name, types)}
          />
        )}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#f4511e"]}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
  },
  countContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  totalCount: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});