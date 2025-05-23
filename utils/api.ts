// utils/api.ts
import { Pokemon, PokemonListResponse, PokemonSpecies } from "../types/pokemon";

// A general-purpose fetch utility for reusing error handling logic
async function genericFetch<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Function to get Pokemon list (initial or with next URL)
export async function getPokemonList(url = ""): Promise<PokemonListResponse> {
  // If no URL is provided, use the default endpoint
  if (!url) {
    url = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";
  }
  
  const data = await genericFetch<PokemonListResponse>(url);
  
  // Filter out special forms with very high IDs
  const filteredResults = data.results.filter(pokemon => {
    const urlParts = pokemon.url.split('/');
    const id = parseInt(urlParts[urlParts.length - 2]);
    return id <= 1008; // Only include main series Pokemon
  });
  
  return {
    ...data,
    results: filteredResults,
    count: 1008
  };
}

// Function to search Pokemon by name
export async function searchPokemon(query: string): Promise<any[]> {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
    const data: PokemonListResponse = await response.json();
    
    const filtered = data.results.filter((pokemon: any) => {
      const urlParts = pokemon.url.split('/');
      const id = parseInt(urlParts[urlParts.length - 2]);
      const isMainSeries = id <= 1008;
      
      // Check if query is a number
      const queryAsNumber = parseInt(query);
      const isNumberSearch = !isNaN(queryAsNumber) && query.trim() === queryAsNumber.toString();
      
      if (isNumberSearch) {
        // Search by Pokemon ID
        return id === queryAsNumber && isMainSeries;
      } else {
        // Search by name (existing functionality)
        const matchesSearch = pokemon.name.toLowerCase().includes(query.toLowerCase());
        return matchesSearch && isMainSeries;
      }
    });
    
    return filtered;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Function to get Pokemon details by ID or name
export function getPokemonDetails(idOrName: string | number): Promise<Pokemon> {
  return genericFetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
}

// Function to get Pokemon species information
export function getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
  return genericFetch<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`);
}