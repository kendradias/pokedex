import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getPokemonDetails, getPokemonSpecies } from "../../utils/api";
import { Pokemon, PokemonSpecies } from "../../types/pokemon";
import StatBar from "../../components/StatBar";

const { width } = Dimensions.get("window");

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("about");
  
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
    
    return englishEntry 
      ? englishEntry.flavor_text.replace(/\f/g, ' ') 
      : "No description available.";
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
            <Text style={styles.description}>{getEnglishDescription()}</Text>
            
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
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
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
});