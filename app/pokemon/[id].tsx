import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions,
  Platform 
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { getPokemonDetails, getPokemonSpecies } from "../../utils/api";
import { Pokemon, PokemonSpecies } from "../../types/pokemon";
import StatBar from "../../components/StatBar";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("about");
  
  //navigation helpers
  const currentId = parseInt(id);
  const prevId = currentId > 1 ? currentId - 1 : null;
  const nextId = currentId < 1008 ? currentId + 1 : null;
  const navigateToPokemon = (newId: number) => {
    router.push(`/pokemon/${newId}`);
  };

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both Pokemon details and species information
        const [pokemonData, speciesData] = await Promise.all([
          getPokemonDetails(id),
          getPokemonSpecies(id)
        ]);
        
        setPokemon(pokemonData);
        setSpecies(speciesData);
      } catch (err) {
        setError("Failed to load Pokemon details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPokemonData();
  }, [id]);
  
  // Function to get color based on Pokemon type
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
  
  // Function to get English description from flavor text entries
  const getEnglishDescription = () => {
    if (!species) return "No description available.";
    
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === "en"
    );
    
    if (!englishEntry) return "No description available.";
  
    // Clean up all formatting characters and normalize spacing
    return englishEntry.flavor_text
      .replace(/\f/g, ' ')           // Remove form feed characters
      .replace(/\n/g, ' ')           // Remove line breaks
      .replace(/\r/g, ' ')           // Remove carriage returns
      .replace(/\t/g, ' ')           // Remove tabs
      .replace(/\u00ad/g, '')        // Remove soft hyphens
      .replace(/\u2010/g, '-')       // Replace hyphens with regular dash
      .replace(/\u2011/g, '-')       // Replace non-breaking hyphens
      .replace(/\u2012/g, '-')       // Replace figure dash
      .replace(/\u2013/g, '-')       // Replace en dash
      .replace(/\u2014/g, '-')       // Replace em dash
      .replace(/­/g, '')             // Remove soft hyphen (HTML entity)
      .replace(/POKéMON/g, 'Pokémon') // Fix the all-caps formatting
      .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
      .replace(/\s*-\s*/g, '-')      // Clean up spaces around dashes
      .trim();                       // Remove leading/trailing whitespace
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading Pokémon details...</Text>
      </View>
    );
  }
  
  if (error || !pokemon) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Failed to load Pokemon"}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const mainType = pokemon.types[0].type.name;
  const mainColor = getTypeColor(mainType);
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <View style={styles.aboutContainer}>
            <Text style={[
              styles.description,
              // Additional web-specific styling if needed
              Platform.OS === 'web' && width > 768 && {
                fontSize: 16,
                lineHeight: 26,
                letterSpacing: 0.2,
              }
            ]}>
              {getEnglishDescription()}
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height:</Text>
              <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight:</Text>
              <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Abilities:</Text>
              <View style={styles.abilitiesContainer}>
                {pokemon.abilities.map((ability, index) => (
                  <Text key={ability.ability.name} style={styles.abilityText}>
                    {ability.ability.name.replace('-', ' ')}
                    {ability.is_hidden && ' (Hidden)'}
                    {index < pokemon.abilities.length - 1 && ', '}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        );
        
      case "stats":
        return (
          <View style={styles.statsContainer}>
            {pokemon.stats.map(stat => (
              <StatBar
                key={stat.stat.name}
                statName={stat.stat.name}
                value={stat.base_stat}
                color={mainColor}
              />
            ))}
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
    {/* Header with background color based on Pokemon type */}
    <View style={[styles.header, { backgroundColor: mainColor }]}>
      {/* Pokemon image */}
      <Image
        source={{ 
          uri: pokemon.sprites.other['official-artwork'].front_default || 
               pokemon.sprites.front_default 
        }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
    
    {/* Pokemon info section */}
    <View style={styles.infoSection}>
      <Text style={styles.pokemonId}>#{id.padStart(3, '0')}</Text>
      <Text style={styles.pokemonName}>{pokemon.name}</Text>
      
      {/* Quick navigation with numbers */}
      <View style={styles.quickNavContainer}>
        {prevId && (
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => navigateToPokemon(prevId)}
          >
            <Text style={styles.quickNavText}>← #{prevId.toString().padStart(3, '0')}</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.spacer} />
        
        {nextId && (
         <TouchableOpacity 
           style={styles.quickNavButton}
           onPress={() => navigateToPokemon(nextId)}
         >
           <Text style={styles.quickNavText}>#{nextId.toString().padStart(3, '0')} →</Text>
         </TouchableOpacity>
       )}
     </View>
     
     {/* Types */}
     <View style={styles.typesContainer}>
       {pokemon.types.map(typeInfo => (
         <View 
           key={typeInfo.type.name} 
           style={[
             styles.typeTag, 
             { backgroundColor: getTypeColor(typeInfo.type.name) }
           ]}
         >
           <Text style={styles.typeText}>{typeInfo.type.name}</Text>
         </View>
       ))}
     </View>
        
        {/* Tabs for different sections */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "about" && [styles.activeTab, { borderColor: mainColor }]
            ]}
            onPress={() => setActiveTab("about")}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === "about" && { color: mainColor }
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "stats" && [styles.activeTab, { borderColor: mainColor }]
            ]}
            onPress={() => setActiveTab("stats")}
          >
            <Text 
              style={[
                styles.tabText, 
                activeTab === "stats" && { color: mainColor }
              ]}
            >
              Stats
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#f4511e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  infoSection: {
    padding: 20,
    paddingTop: 30,
    // Add responsive constraints for web
    maxWidth: width > 768 ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  pokemonId: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 12,
  },
  typesContainer: {
    paddingHorizontal: 4,
    flexDirection: "row",
    marginBottom: 24,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  typeText: {
    color: "#fff",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  tabContent: {
    paddingTop: 10,
  },
  aboutContainer: {
    paddingBottom: 24,
  },
  description: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    lineHeight: Platform.OS === 'web' ? 24 : 20,
    color: "#333",
    marginBottom: 16,
    textAlign: 'left',
    // Better text wrapping for web
    ...(Platform.OS === 'web' && width > 768 && {
      maxWidth: '90%',
      alignSelf: 'flex-start',
    }),
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  infoLabel: {
    width: Platform.OS === 'web' && width > 768 ? 120 : 100,
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: Platform.OS === 'web' ? 1 : 0, // Take remaining space on web
  },
  abilitiesContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  abilityText: {
    fontSize: 14,
    color: "#333",
    textTransform: "capitalize",
  },
  statsContainer: {
    paddingBottom: 24,
  },
  quickNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  quickNavButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#EEB7B7',
    borderRadius: 20,
  },
  quickNavText: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
});