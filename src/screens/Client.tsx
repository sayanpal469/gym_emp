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
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const screenWidth = Dimensions.get('window').width;

const Client = ({ navigation }: any) => {
  const { getAllPt, loading } = usePt();
  const { role } = useSelector((state: RootState) => state.auth);
  const [clientList, setClientList] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'running' | 'upcoming' | 'expired'>('all');
  const [summaryCards, setSummaryCards] = useState([
    { label: 'Renew\nThis Month', value: '0', icon: 'calendar' },
    { label: 'Renew In\nNext Month', value: '0', icon: 'calendar-arrow-right' },
    { label: 'Total\nClients', value: '0', icon: 'account-group' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getAllPt();
    if (res.success && res.data) {
      console.log("Client Data:", res.data);
      
      // Process the flat array from API
      const formatted = res.data.map((client: any) => {
        // Determine status based on package_status
        let status = 'running'; // Default
        
        if (client.package_status === 'upcoming') {
          status = 'upcoming';
        } else if (client.package_status === 'expired') {
          status = 'expired';
        } else if (client.package_status === 'no_package' || client.package_status === 'not_package') {
          status = 'running'; // Treat no_package/not_package as running
        }
        
        // Check if PT is expiring this month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        let renewThisMonth = false;
        if (client.end_date && client.end_date !== "0000-00-00") {
          try {
            const endDate = new Date(client.end_date);
            const endMonth = endDate.getMonth();
            const endYear = endDate.getFullYear();
            renewThisMonth = endMonth === currentMonth && endYear === currentYear && status === 'running';
          } catch (error) {
            console.error('Error parsing end date:', error);
          }
        }
        
        return {
          ...client,
          status,
          renewThisMonth,
          member_name: client.name || client.member_name || 'No Name',
        };
      });

      setClientList(formatted);
      setFilteredClients(formatted);

      // Calculate summaries
      const totalClients = formatted.length;
      const runningClients = formatted.filter(c => c.status === 'running').length;
      const upcomingClients = formatted.filter(c => c.status === 'upcoming').length;
      const renewThisMonthCount = formatted.filter(c => c.renewThisMonth).length;

      setSummaryCards([
        { 
          label: 'Renew\nThis Month', 
          value: `${renewThisMonthCount}`, 
          icon: 'calendar' 
        },
        { 
          label: 'Renew In\nNext Month', 
          value: `${upcomingClients}`, 
          icon: 'calendar-arrow-right' 
        },
        { 
          label: 'Total\nClients', 
          value: `${totalClients}`, 
          icon: 'account-group' 
        },
      ]);
    }
  };

  // Filter clients based on active filter
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredClients(clientList);
    } else {
      setFilteredClients(clientList.filter(client => client.status === activeFilter));
    }
  }, [activeFilter, clientList]);

  // Function to get status style
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

  // Function to get display status text
  const getDisplayStatus = (packageStatus: string) => {
    switch (packageStatus) {
      case 'no_package':
      case 'not_package':
        return 'ACTIVE';
      case 'upcoming':
        return 'UPCOMING';
      case 'running':
        return 'RUNNING';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'ACTIVE';
    }
  };

  const getFilterButtonStyle = (filterType: string) => {
    return activeFilter === filterType ? styles.activeFilterButton : styles.inactiveFilterButton;
  };

  const getFilterTextStyle = (filterType: string) => {
    return activeFilter === filterType ? styles.activeFilterText : styles.inactiveFilterText;
  };

  const getStatusCount = (status: string) => {
    return clientList.filter(client => client.status === status).length;
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00") {
      return 'Not set';
    }
    return dateString;
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

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[styles.filterButton, getFilterButtonStyle('all')]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, getFilterTextStyle('all')]}>
              All ({clientList.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, getFilterButtonStyle('running')]}
            onPress={() => setActiveFilter('running')}
          >
            <Text style={[styles.filterText, getFilterTextStyle('running')]}>
              Running ({getStatusCount('running')})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, getFilterButtonStyle('upcoming')]}
            onPress={() => setActiveFilter('upcoming')}
          >
            <Text style={[styles.filterText, getFilterTextStyle('upcoming')]}>
              Upcoming ({getStatusCount('upcoming')})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, getFilterButtonStyle('expired')]}
            onPress={() => setActiveFilter('expired')}
          >
            <Text style={[styles.filterText, getFilterTextStyle('expired')]}>
              Expired ({getStatusCount('expired')})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Client List */}
      <Text style={styles.listTitle}>LIST</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E4D" />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {filteredClients.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-off-outline" size={50} color="#ccc" />
              <Text style={styles.emptyStateText}>
                No {activeFilter === 'all' ? '' : activeFilter} clients found
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchData}
              >
                <MaterialIcons name="refresh" size={20} color="#075E4D" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredClients.map((client, index) => {
              const statusStyle = getStatusStyle(client.status);
              const displayStatus = getDisplayStatus(client.package_status);
              
              return (
                <TouchableOpacity
                  key={client.id || index}
                  style={[
                    styles.listItem,
                    client.renewThisMonth && styles.renewHighlight
                  ]}
                  onPress={() => navigation.navigate('ClientDetails', { client })}
                >
                  <View style={styles.listIconBox}>
                    <FontAwesome name="user-circle" size={28} color="#075E4D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{client.member_name}</Text>
                    {/* <Text style={styles.clientPhone}>{client.phone || 'No phone'}</Text> */}
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.dateText}>Start: {formatDate(client.start_date)}</Text>
                    </View>
                    <View style={styles.dateRow2}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.dateText}>End: {formatDate(client.end_date)}</Text>
                    </View>
                    {client.renewThisMonth && (
                      <View style={styles.renewBadge}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#ff6b35" />
                        <Text style={styles.renewText}>Renews this month</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={{ color: statusStyle.color, fontWeight: '600', fontSize: 10 }}>
                      {displayStatus}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    marginLeft: 10,
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
  filterContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  filterScrollContent: {
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#075E4D',
  },
  inactiveFilterButton: {
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  inactiveFilterText: {
    color: '#666666',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 22,
    marginTop: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 80,
    minHeight: 200,
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
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  renewHighlight: {
    borderWidth: 2,
    borderColor: '#ff6b35',
    backgroundColor: '#fffaf7',
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
    marginBottom: 4,
    color: '#222',
  },
  clientPhone: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#444',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  renewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  renewText: {
    fontSize: 11,
    color: '#ff6b35',
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#075E4D',
    fontWeight: '600',
    marginLeft: 6,
  },
});