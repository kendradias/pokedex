// components/PokemonCard.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getPokemonDetails } from "../utils/api";

type PokemonCardProps = {
  pokemon: {
    name: string;
    url: string;
  };
  onTypesLoaded?: (types: string[]) => void;
};

export default function PokemonCard({ pokemon, onTypesLoaded }: PokemonCardProps) {
  const router = useRouter();
  const [pokemonDetails, setPokemonDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false); // Start as false
  const [error, setError] = useState<string | null>(null);
  
  // Extract the Pokemon ID from the URL
  const pokemonId = pokemon.url.split('/')[pokemon.url.split('/').length - 2];
  
  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        const details = await getPokemonDetails(pokemonId);
        setPokemonDetails(details);
        
        if (onTypesLoaded) {
          const types = details.types.map((typeInfo: any) => typeInfo.type.name);
          onTypesLoaded(types);
        }
      } catch (err) {
        setError("Error loading Pokemon details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPokemonDetails();
  }, [pokemonId, onTypesLoaded]);
  
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
  
  // Show basic card structure immediately, even while loading details
  const cardColor = pokemonDetails ? getTypeColor(pokemonDetails.types[0].type.name) : '#DDD';
  
  return (
    <TouchableOpacity onPress={() => router.push(`/pokemon/${pokemonId}`)}>
      <View style={[styles.card, { borderColor: cardColor }]}>
        <View style={styles.imageContainer}>
          {pokemonDetails ? (
            <Image
              source={{ 
                uri: pokemonDetails.sprites.other['official-artwork'].front_default || 
                     pokemonDetails.sprites.front_default 
              }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              {loading ? (
                <ActivityIndicator size="small" color="#f4511e" />
              ) : (
                <Text style={styles.placeholderText}>#{pokemonId}</Text>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.id}>#{pokemonId.padStart(3, '0')}</Text>
          <Text style={styles.name}>
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </Text>
          
          <View style={styles.typesContainer}>
            {pokemonDetails ? (
              pokemonDetails.types.map((typeInfo: any) => (
                <View 
                  key={typeInfo.type.name} 
                  style={[
                    styles.typeTag, 
                    { backgroundColor: getTypeColor(typeInfo.type.name) }
                  ]}
                >
                  <Text style={styles.typeText}>{typeInfo.type.name}</Text>
                </View>
              ))
            ) : (
              <View style={styles.loadingTypes}>
                {loading ? (
                  <Text style={styles.loadingText}>Loading types...</Text>
                ) : error ? (
                  <Text style={styles.errorText}>Error</Text>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    margin: 8,
    padding: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#F5F5F5',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  id: {
    color: "#666",
    fontSize: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  typesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    minHeight: 24, // Reserve space for types
  },
  typeTag: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  typeText: {
    color: "#fff",
    fontSize: 12,
    textTransform: 'capitalize',
  },
  loadingTypes: {
    flex: 1,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});