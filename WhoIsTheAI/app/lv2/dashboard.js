import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://wita-api.ngrok.io/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff" }}>Failed to load data from server.</Text>
      </View>
    );
  }

  const chartData = [
    {
      name: "Human Wins",
      population: data.humanWins,
      color: "#4b9cd3",
      legendFontColor: "#fff",
      legendFontSize: 15,
    },
    {
      name: "AI Wins",
      population: data.aiWins,
      color: "#e76f51",
      legendFontColor: "#fff",
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: () => `rgba(255, 255, 255, 1)`,
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
          hasLegend={false}
        />
        <View style={styles.legendContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[styles.legendColorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.legendText}>
                {item.population} {item.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.statText}>AI Win Rate:</Text>
        <Text style={styles.statValue}>{data.aiWinRate}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statText}>Total Games Played:</Text>
        <Text style={styles.statValue}>{data.totalGames}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statText}>Average Game Time:</Text>
        <Text style={styles.statValue}>{data.avgGameTime}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1f1f1f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#1f1f1f",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  card: {
    width: "100%",
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  legendContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 16,
    color: "#fff",
  },
  statText: {
    fontSize: 18,
    color: "#ccc",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
    color: "#fff",
  },
});
