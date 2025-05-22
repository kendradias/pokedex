import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface StatBarProps {
  statName: string;
  value: number;
  maxValue?: number;
  color?: string;
}

export default function StatBar({
  statName,
  value,
  maxValue = 255,
  color = "#4CAF50",
}: StatBarProps) {
  // Calculate the percentage width for the progress bar
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  // Format the stat name for better display
  const formatStatName = (name: string) => {
    switch (name) {
      case "hp":
        return "HP";
      case "attack":
        return "Attack";
      case "defense":
        return "Defense";
      case "special-attack":
        return "Sp. Atk";
      case "special-defense":
        return "Sp. Def";
      case "speed":
        return "Speed";
      default:
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.statName}>{formatStatName(statName)}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statName: {
    width: 80,
    fontSize: 14,
    fontWeight: "500",
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    marginRight: 8,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
});