import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const statusStyles: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  running: { label: 'Running', color: '#0f9d58', bg: '#e6f4ea', icon: 'play-circle-outline' },
  upcoming: { label: 'Upcoming', color: '#f4b400', bg: '#fff8e1', icon: 'time-outline' },
  expired: { label: 'Expired', color: '#db4437', bg: '#fdecea', icon: 'close-circle-outline' },
};

const ClientDetails = ({ route, navigation }: any) => {
  const { client } = route.params;
  const statusInfo = statusStyles[client.status] || statusStyles.expired;

  console.log('Client Details:', client);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>CLIENT DETAILS</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}
          onPress={() => navigation.navigate('BMI', { memberId: client.member_id })}>
          <Text style={styles.actionText}>BMI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => console.log('DPR pressed')}>
          <Text style={styles.actionText}>DPR</Text>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{client.member_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color="#555" />
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>{client.start_date}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color="#555" />
          <Text style={styles.label}>End Date:</Text>
          <Text style={styles.value}>{client.end_date}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="pricetag-outline" size={18} color="#555" />
          <Text style={styles.label}>Package:</Text>
          <Text style={styles.value}>{client.package_name}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ClientDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 35,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#222',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 4,
    color: '#444',
  },
  value: {
    fontSize: 14,
    color: '#222',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#075E4D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

});
