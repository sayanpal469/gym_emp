import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { baseClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';
import Toast from 'react-native-toast-message';

const BMIScreen = ({ route, navigation }: any) => {
  const { memberId, memberName } = route.params;
  const [bmiData, setBmiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  console.log("BMI DATA:::::::::::::", bmiData);

  const fetchBMIData = async () => {
    try {
      const response = await baseClient.post(APIEndpoints.getBmi, {
        action: "fetch",
        member_id: memberId
      });

      if (response.data.ok) {
        setBmiData(response.data.reports || []);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Fetch Failed',
          text2: response.data.message || 'Failed to fetch BMI data',
        });
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBMIData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBMIData();
  };

  const renderBMICard = ({ item }: any) => {
    const createdAt = new Date(item.created_at).toLocaleDateString();

    return (
      <View style={styles.card}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <Text style={styles.memberName}>{memberName}</Text>
          <Text style={styles.date}>{createdAt}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="resize" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Height: {item.height} cm</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="barbell" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Weight: {item.weight} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Age: {item.age}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="transgender" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Gender: {item.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="transgender" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Ideal Body Weight: {item.ideal_body_weight}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="transgender" size={16} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>Body Fat: {item.body_fat_percent}%</Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiLabel}>BMI</Text>
            <Text style={styles.bmiValue}>{item.bmi?.value?.toFixed(1)}</Text>
          </View>
          <View style={styles.bmrContainer}>
            <Text style={styles.bmrLabel}>BMR</Text>
            <Text style={styles.bmrValue}>{item.bmr}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#075E4D" barStyle="light-content" />
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>BMI REPORT</Text>
            <View style={styles.headerRight}>
              {/* Empty view for symmetry */}
              <View style={styles.placeholderButton} />
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#075E4D" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#075E4D" barStyle="light-content" />

      {/* Main Container */}
      <View style={styles.mainContainer}>
        {/* Header - Matching Attendance.tsx */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>BMI REPORT</Text>
          <View style={styles.headerRight}>
            {/* Empty view for symmetry */}
            <View style={styles.placeholderButton} />
          </View>
        </View>

        {/* BMI List */}
        <FlatList
          data={bmiData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBMICard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#075E4D']}
              tintColor="#075E4D"
              progressBackgroundColor="#fff"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No BMI records found</Text>
            </View>
          }
        />

        {/* Floating Add Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate('AddBMI', {
              memberId,
              memberName,
            })
          }
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#075E4D',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#075E4D',
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    paddingRight: 12,
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  bmiContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  bmiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#222',
  },
  bmrContainer: {
    alignItems: 'center',
  },
  bmrLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  bmrValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#075E4D',
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: '#075E4D',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default BMIScreen;