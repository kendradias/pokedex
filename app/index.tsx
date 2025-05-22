import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { getPokemonList } from '../utils/api';
import { PokemonListResponse, Result } from '../types/pokemon';
import PokemonCard from '../components/PokemonCard';

export default function HomePage() {
  const [pokemonData, setPokemonData] = useState<PokemonListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch Pokemon data
  const fetchPokemon = async (url = "") => {
    try {
      setError(null);
      const data = await getPokemonList(url);
      setPokemonData(data);
    } catch (err) {
      setError('Failed to fetch Pokemon data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchPokemon();
  }, []);

  // Handle refresh (pull to refresh)
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPokemon();
  };

  // Handle loading more Pokemon when reaching the end of the list
  const handleLoadMore = async () => {
    if (loadingMore || !pokemonData || !pokemonData.next) return;
    
    try {
      setLoadingMore(true);
      const newData = await getPokemonList(pokemonData.next);
      
      // Merge the new results with existing ones
      setPokemonData({
        ...newData,
        results: [...pokemonData.results, ...newData.results],
      });
    } catch (err) {
      console.error('Error loading more Pokemon:', err);
      // Don't show an error toast here to avoid disrupting the UX
    } finally {
      setLoadingMore(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Render footer (loading indicator when fetching more items)
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#f4511e" />
        <Text style={styles.footerText}>Loading more Pokémon...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.totalCount}>Total Pokémon: {pokemonData?.count || 0}</Text>
      
      <FlatList
        data={pokemonData?.results}
        renderItem={({ item }) => <PokemonCard pokemon={item} />}
        keyExtractor={(item) => item.name}
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
  totalCount: {
    fontSize: 16,
    fontWeight: '500',
    margin: 16,
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
});