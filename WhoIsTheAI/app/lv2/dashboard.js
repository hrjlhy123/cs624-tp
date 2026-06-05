import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://wita-api.ngrok.io";

export default function App() {
  const { width } = useWindowDimensions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/dashboard`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Dashboard request failed: ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (!active) return;
        setData(json);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load dashboard data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      humanWins: Number(data?.humanWins) || 0,
      aiWins: Number(data?.aiWins) || 0,
      aiWinRate: data?.aiWinRate ?? "0.00",
      totalGames: Number(data?.totalGames) || 0,
      avgGameTime: data?.avgGameTime || "0s",
    }),
    [data]
  );

  const hasGames = stats.humanWins + stats.aiWins > 0;
  const chartWidth = Math.max(260, Math.min(width - 56, 520));

  const chartData = [
    {
      name: "Human Wins",
      population: stats.humanWins,
      color: "#4b9cd3",
      legendFontColor: "#fff",
      legendFontSize: 15,
    },
    {
      name: "AI Wins",
      population: stats.aiWins,
      color: "#e76f51",
      legendFontColor: "#fff",
      legendFontSize: 15,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        {hasGames ? (
          <>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={220}
              chartConfig={{
                color: () => "rgba(255, 255, 255, 1)",
                backgroundGradientFrom: "transparent",
                backgroundGradientTo: "transparent",
                decimalPlaces: 0,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="12"
              absolute
              hasLegend={false}
            />
            <View style={styles.legendContainer}>
              {chartData.map((item) => (
                <View key={item.name} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColorBox,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {item.population} {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>No completed games yet.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.statText}>AI Win Rate</Text>
        <Text style={styles.statValue}>{stats.aiWinRate}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statText}>Total Games Played</Text>
        <Text style={styles.statValue}>{stats.totalGames}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statText}>Average Game Time</Text>
        <Text style={styles.statValue}>{stats.avgGameTime}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1f1f1f",
    minHeight: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
  },
  errorText: {
    width: "100%",
    maxWidth: 640,
    color: "#ffd1d1",
    backgroundColor: "rgba(255, 92, 92, 0.16)",
    borderColor: "rgba(255, 92, 92, 0.35)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 640,
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.32,
    shadowRadius: 4,
    elevation: 4,
    alignItems: "center",
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
  emptyText: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
  },
  statText: {
    fontSize: 17,
    color: "#ccc",
    textAlign: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
    color: "#fff",
    textAlign: "center",
  },
});
