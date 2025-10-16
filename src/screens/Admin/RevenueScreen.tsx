import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

// Types for our revenue data
interface RevenueDataPoint {
  date: string;
  amount: number;
}

interface RevenueDataSet {
  labels: string[];
  values: number[];
}

// Generate sample revenue data
const generateRevenueData = (period: 'daily' | 'weekly' | 'monthly'): RevenueDataPoint[] => {
  const data: RevenueDataPoint[] = [];
  const currentDate = new Date();
  let dataPoints = 0;

  if (period === 'daily') {
    dataPoints = 7; // 7 points for daily view (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < dataPoints; i++) {
      const amount = Math.floor(Math.random() * 1000) + 500; // Random amount between 500-1500
      data.push({
        date: days[i],
        amount,
      });
    }
  } else if (period === 'weekly') {
    dataPoints = 4; // 4 weeks in a month
    for (let i = 0; i < dataPoints; i++) {
      const amount = Math.floor(Math.random() * 5000) + 2000; // Random amount between 2000-7000
      data.push({
        date: `Week ${i + 1}`,
        amount,
      });
    }
  } else {
    dataPoints = 12; // Months in a year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < dataPoints; i++) {
      const amount = Math.floor(Math.random() * 20000) + 10000; // Random amount between 10000-30000
      data.push({
        date: months[i],
        amount,
      });
    }
  }

  return data;
};

// Format revenue data for the chart
const formatChartData = (data: RevenueDataPoint[]): RevenueDataSet => {
  return {
    labels: data.map(item => item.date),
    values: data.map(item => item.amount),
  };
};

// Calculate revenue metrics
const calculateMetrics = (data: RevenueDataPoint[]) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const average = total / data.length;
  const highest = Math.max(...data.map(item => item.amount));
  const lowest = Math.min(...data.map(item => item.amount));

  return { total, average, highest, lowest };
};

const RevenueScreen = ({ navigation }: any) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch revenue data based on selected period
  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateRevenueData(selectedPeriod);
      setRevenueData(data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRevenueData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  // Format numbers with commas
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Get chart data
  const chartData = formatChartData(revenueData);
  const metrics = calculateMetrics(revenueData);

  // Chart configuration
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4A90E2',
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#075E4D" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Revenue Analytics</Text>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons
              name="refresh"
              size={26}
              color={"#fff"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90E2']}
            tintColor="#4A90E2"
          />
        }
        showsVerticalScrollIndicator={false}
      >


        {/* Revenue Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="cash" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(metrics.total)}</Text>
            <Text style={styles.summaryLabel}>Previous Month</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#2196F3" />
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(metrics.average)}</Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'daily' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('daily')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'daily' && styles.periodButtonTextActive
            ]}>
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'weekly' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('weekly')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'weekly' && styles.periodButtonTextActive
            ]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 'monthly' && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === 'monthly' && styles.periodButtonTextActive
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenue Trend</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#4A90E2' }]} />
                <Text style={styles.legendText}>Revenue</Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="large" color="#4A90E2" />
              <Text style={styles.loadingText}>Loading chart data...</Text>
            </View>
          ) : (
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.values }],
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withVerticalLines={true}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
            />
          )}
        </View>


        <View style={styles.metricsContainer}>
          {/* Projection Card */}
          <View style={styles.projectionCard}>
            <View style={styles.projectionHeader}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#9C27B0" />
              <Text style={styles.projectionTitle}>Next Month Projection</Text>
            </View>
            <Text style={styles.projectionValue}>{formatCurrency(metrics.total * 1.15)}</Text>
            <View style={styles.projectionBadge}>
              <MaterialIcons name="arrow-upward" size={16} color="#4CAF50" />
              <Text style={styles.projectionBadgeText}>15% increase</Text>
            </View>
          </View>
        </View>


        {/* Additional Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="trending-up" size={20} color="#4CAF50" />
                <Text style={styles.metricTitle}>Highest</Text>
              </View>
              <Text style={styles.metricValue}>{formatCurrency(metrics.highest)}</Text>
              <Text style={styles.metricSubtitle}>PT Renew</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <MaterialCommunityIcons name="trending-down" size={20} color="#F44336" />
                <Text style={styles.metricTitle}>Lowest</Text>
              </View>
              <Text style={styles.metricValue}>{formatCurrency(metrics.lowest)}</Text>
              <Text style={styles.metricSubtitle}>Membership Renew</Text>
            </View>
          </View>


        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {[1, 2, 3].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.transactionItem}
              onPress={() => navigation.navigate('TransactionDetail', {
                transaction: {
                  id: item,
                  name: `Customer Payment #${item}`,
                  date: `Today, 10:3${item} AM`,
                  amount: 1500 + item * 100,
                  type: 'income',
                  status: 'completed',
                  customer: `Customer ${item}`,
                  paymentMethod: 'Credit Card',
                  transactionId: `TXN_00123${item}`,
                  description: item === 1 ? 'Personal Training Session Renewal' :
                    item === 2 ? 'Monthly Membership Fee' :
                      'Additional Service Charge',
                  category: item === 1 ? 'PT Renew' : item === 2 ? 'Membership' : 'Service',
                }
              })}
            >
              <View style={styles.transactionIcon}>
                <FontAwesome name="money-bill-wave" size={16} color="#4CAF50" />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>Customer Payment #{item}</Text>
                <Text style={styles.transactionDate}>Today, 10:3{item} AM</Text>
              </View>
              <Text style={styles.transactionAmount}>+₹{1500 + item * 100}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#075E4D',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#075E4D',
  },
  periodButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  legend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  chartLoading: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  projectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  projectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  projectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  transactionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
});

export default RevenueScreen;