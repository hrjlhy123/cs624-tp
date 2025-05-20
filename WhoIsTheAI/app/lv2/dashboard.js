import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fd43b121-92c8-49c5-8a46-f35e65f71983.mock.pstmn.io/dashboard')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  const chartData = [
    {
      name: 'Human Wins',
      population: data.humanWins,
      color: 'blue',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
    {
      name: 'AI Wins',
      population: data.aiWins,
      color: 'red',
      legendFontColor: '#000',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20 }}>Dashboard</Text>

      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: () => `rgba(0, 0, 0, 1)`,
        }}
        accessor={'population'}
        backgroundColor={'transparent'}
        paddingLeft={'15'}
        absolute
        hasLegend={false}
      />

      <View style={{ marginTop: 10, alignItems: 'center' }}>
        {chartData.map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <View style={{ width: 12, height: 12, backgroundColor: item.color, marginRight: 8, borderRadius: 6 }} />
            <Text>{item.population} {item.name}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontSize: 18, marginTop: 20 }}>AI Win Rate: {data.aiWinRate}%</Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>Total Games Played: {data.totalGames}</Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>Average Game Time: {data.avgGameTime}</Text>
    </ScrollView>
  );
}