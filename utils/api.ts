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
export function getPokemonList(url = ""): Promise<PokemonListResponse> {
  // If no URL is provided, use the default endpoint
  if (!url) {
    url = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";
  }
  
  return genericFetch<PokemonListResponse>(url);
}

// Function to get Pokemon details by ID or name
export function getPokemonDetails(idOrName: string | number): Promise<Pokemon> {
  return genericFetch<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
}

// Function to get Pokemon species information
export function getPokemonSpecies(idOrName: string | number): Promise<PokemonSpecies> {
  return genericFetch<PokemonSpecies>(`https://pokeapi.co/api/v2/pokemon-species/${idOrName}`);
}