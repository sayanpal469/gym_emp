import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LeaveApplicationScreen = ({ navigation }: any) => {
    const [activeTab, setActiveTab] = useState('pending');

    const leaveRecords = {
        pending: [
            {
                id: '1',
                type: 'Sick Leave',
                date: '2024-01-15',
                duration: '2 days',
                status: 'Pending',
                reason: 'Medical appointment',
            },
        ],
        approved: [
            {
                id: '2',
                type: 'Vacation',
                date: '2024-01-10',
                duration: '5 days',
                status: 'Approved',
                reason: 'Family vacation',
            },
        ],
        rejected: [
            {
                id: '3',
                type: 'Personal',
                date: '2024-01-05',
                duration: '1 day',
                status: 'Rejected',
                reason: 'Personal work',
            },
        ],
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return '#4CAF50';
            case 'Pending': return '#FF9800';
            case 'Rejected': return '#F44336';
            default: return '#666';
        }
    };

    const renderLeaveCard = ({ item }: any) => (
        <View style={styles.leaveCard}>
            <View style={styles.leaveHeader}>
                <Text style={styles.leaveType}>{item.type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.leaveDetails}>
                <View style={styles.detailItem}>
                    <MaterialIcons name="date-range" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.date}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialIcons name="access-time" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.duration}</Text>
                </View>
            </View>

            <Text style={styles.reasonLabel}>Reason:</Text>
            <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Leave Applications</Text>
                <TouchableOpacity style={styles.newButton}>
                    <MaterialIcons name="add" size={24} color="#075E4D" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Pending
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
                    onPress={() => setActiveTab('approved')}
                >
                    <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
                        Approved
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'rejected' && styles.activeTab]}
                    onPress={() => setActiveTab('rejected')}
                >
                    <Text style={[styles.tabText, activeTab === 'rejected' && styles.activeTabText]}>
                        Rejected
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Leave List */}
            <FlatList
                data={leaveRecords[activeTab as keyof typeof leaveRecords]}
                renderItem={renderLeaveCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inbox" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No {activeTab} leave applications</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    newButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    activeTab: {
        backgroundColor: '#075E4D',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
    leaveCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leaveHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    leaveType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    leaveDetails: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    reasonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    reasonText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});

export default LeaveApplicationScreen;