import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePt } from '../hooks/usePt'; // adjust path

const screenWidth = Dimensions.get('window').width;

const Client = ({ navigation }: any) => {
  const { getAllPt, loading } = usePt();
  const [clientList, setClientList] = useState<any[]>([]);
  const [summaryCards, setSummaryCards] = useState([
    { label: 'Renew\nThis Month', value: '0', icon: 'calendar' },
    { label: 'Renew In\nNext Month', value: '0', icon: 'calendar-arrow-right' },
    { label: 'Total\nClients', value: '0', icon: 'account-group' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllPt();
      if (res.success && res.data) {
        const formatted: any[] = [];

        Object.values(res.data).forEach((group: any) => {
          ['running', 'upcoming', 'expired'].forEach((status) => {
            if (Array.isArray(group[status])) {
              group[status].forEach((item: any) => {
                formatted.push({
                  ...item,
                  status,
                });
              });
            }
          });
        });

        setClientList(formatted);

        // Calculate summaries
        const totalClients = formatted.length;
        const renewThisMonth = formatted.filter(c => c.status === 'running').length;
        const renewNextMonth = formatted.filter(c => c.status === 'upcoming').length;

        setSummaryCards([
          { label: 'Renew\nThis Month', value: `${renewThisMonth}`, icon: 'calendar' },
          { label: 'Renew In\nNext Month', value: `${renewNextMonth}`, icon: 'calendar-arrow-right' },
          { label: 'Total\nClients', value: `${totalClients}`, icon: 'account-group' },
        ]);
      }
    };

    fetchData();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'running':
        return { backgroundColor: '#D4EDDA', color: '#155724' };
      case 'upcoming':
        return { backgroundColor: '#FFF3CD', color: '#856404' };
      case 'expired':
        return { backgroundColor: '#F8D7DA', color: '#721C24' };
      default:
        return { backgroundColor: '#E2E3E5', color: '#383D41' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>CLIENT LIST</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {summaryCards.map((item, index) => (
          <View key={index} style={styles.summaryCard}>
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color="#ffffff"
              style={{
                marginBottom: 6,
                backgroundColor: '#075E4D',
                padding: 8,
                borderRadius: 10,
              }}
            />
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Client List */}
      <Text style={styles.listTitle}>LIST</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#075E4D" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {clientList.map((client, index) => {
            const statusStyle = getStatusStyle(client.status);
            return (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() => navigation.navigate('ClientDetails', { client })}
              >
                <View style={styles.listIconBox}>
                  <FontAwesome name="user-circle" size={28} color="#075E4D" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>{client.member_name}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={16} />
                    <Text style={styles.dateText}>Start: {client.start_date}</Text>
                    </View>
                    <View style={styles.dateRow2}>
                    <Ionicons name="calendar-outline" size={16} />
                    <Text style={styles.dateText}>End: {client.end_date}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={{ color: statusStyle.color, fontWeight: '600', fontSize: 12 }}>
                    {client.status.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Client;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 20,
  },
  summaryCard: {
    width: (screenWidth - 40) / 3,
    backgroundColor: '#f2f2f2',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 4,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 22,
    marginTop: 30,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  listIconBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'flex-start',
  },
   dateRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'flex-start',
    marginTop:8,
  },
  dateText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#444',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
