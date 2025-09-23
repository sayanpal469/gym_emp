// MembersDetails.tsx
import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

interface Subscription {
    package_name: string;
    start_date: string;
    end_date: string;
    months: string;
    ext_month: string;
    remaining_days: number | null;
}

interface Member {
    member_id: string;
    member_name: string;
    email: string | null;
    contact: string;
    gender: string;
    branch_name: string | null;
    subscription: Subscription;
    avatar?: string;
}

const MembersDetails = ({ route }) => {
    const navigation = useNavigation();
    const { member }: { member: Member } = route.params;
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'inactive'>('active');

    const getInitials = (name: string) => {
        if (!name) return 'NA';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return 'Not provided';
        return phone;
    };

    const getSubscriptionStatus = (subscription: Subscription) => {
        if (subscription.end_date === 'Lifetime') return 'active';
        if (!subscription.remaining_days) return 'inactive';
        return subscription.remaining_days > 30 ? 'active' : 'upcoming';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'upcoming': return '#FF9800';
            case 'inactive': return '#F44336';
            default: return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'upcoming': return 'Upcoming Renewal';
            case 'inactive': return 'Inactive';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        if (dateString === 'Lifetime') return 'Lifetime';
        if (!dateString) return 'Not specified';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Filter subscriptions based on active tab
    const currentSubscriptionStatus = getSubscriptionStatus(member.subscription);
    const showCurrentSubscription = currentSubscriptionStatus === activeTab;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialIcons name="arrow-back-ios" size={22} color="#075E4D" />
                </TouchableOpacity>
                <Text style={styles.title}>MEMBER DETAILS</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Member Info Card */}
                <View style={styles.memberCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {getInitials(member.member_name)}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.memberName}>{member.member_name}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={18} color="#075E4D" />
                        <Text style={styles.infoText}>
                            {member.branch_name || 'No branch assigned'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={18} color="#075E4D" />
                        <Text style={styles.infoText}>{formatPhoneNumber(member.contact)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={18} color="#075E4D" />
                        <Text style={styles.infoText}>
                            {member.email || 'No email provided'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={18} color="#075E4D" />
                        <Text style={styles.infoText}>
                            {member.gender || 'Not specified'}
                        </Text>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                            Active
                        </Text>
                        {activeTab === 'active' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                        onPress={() => setActiveTab('upcoming')}
                    >
                        <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                            Upcoming
                        </Text>
                        {activeTab === 'upcoming' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'inactive' && styles.activeTab]}
                        onPress={() => setActiveTab('inactive')}
                    >
                        <Text style={[styles.tabText, activeTab === 'inactive' && styles.activeTabText]}>
                            Inactive
                        </Text>
                        {activeTab === 'inactive' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                </View>

                {/* Subscription Details */}
                <View style={styles.subscriptionsContainer}>
                    {showCurrentSubscription ? (
                        <View style={styles.subscriptionCard}>
                            <View style={styles.subscriptionHeader}>
                                <Text style={styles.subscriptionName}>
                                    {member.subscription.package_name}
                                </Text>
                                <View style={[
                                    styles.statusBadge, 
                                    { backgroundColor: getStatusColor(currentSubscriptionStatus) }
                                ]}>
                                    <Text style={styles.statusText}>
                                        {getStatusText(currentSubscriptionStatus)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.subscriptionDetails}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Start Date</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDate(member.subscription.start_date)}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>End Date</Text>
                                    <Text style={styles.detailValue}>
                                        {formatDate(member.subscription.end_date)}
                                    </Text>
                                </View>
                            </View>

                            {member.subscription.remaining_days !== null && (
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Remaining Days</Text>
                                    <Text style={styles.detailValue}>
                                        {member.subscription.remaining_days} days
                                    </Text>
                                </View>
                            )}

                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Duration</Text>
                                <Text style={styles.detailValue}>
                                    {member.subscription.months || 
                                     (member.subscription.end_date === 'Lifetime' ? 'Lifetime' : 'Not specified')}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptySubscriptions}>
                            <Ionicons name="document-text-outline" size={48} color="#ccc" />
                            <Text style={styles.emptySubscriptionsText}>
                                No {getStatusText(activeTab).toLowerCase()} subscriptions
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        paddingTop: 35,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 15,
        paddingVertical: 10,
    },
    backButton: {
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        flex: 1,
        textAlign: 'center',
        color: '#075E4D',
    },
    headerRight: {
        width: 42,
    },
    container: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    memberCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#075E4D',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#075E4D',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#e0e0e0',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 28,
    },
    memberName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#075E4D',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        justifyContent: 'flex-start',
        backgroundColor: '#f8f9fa',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#4a4a4a',
        fontWeight: '500',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 25,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 5,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeTab: {
        backgroundColor: '#f0f7f5',
        borderRadius: 12,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    activeTabText: {
        color: '#075E4D',
        fontWeight: '700',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 5,
        width: 20,
        height: 3,
        backgroundColor: '#075E4D',
        borderRadius: 3,
    },
    subscriptionsContainer: {
        marginBottom: 20,
    },
    subscriptionCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
        borderLeftWidth: 5,
        borderLeftColor: '#075E4D',
    },
    subscriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    subscriptionName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
    subscriptionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    detailItem: {
        flex: 1,
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 5,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    emptySubscriptions: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 50,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 10,
    },
    emptySubscriptionsText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
});

export default MembersDetails;