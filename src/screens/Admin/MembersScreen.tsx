// MembersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TextInput,
    Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { authClient } from '../../services/api.clients';
import { APIEndpoints } from '../../services/api.endpoints';
import { store } from '../../redux/store';

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

interface ApiResponse {
    status: string;
    count: number;
    data: Member[];
}

const MembersScreen = () => {
    const navigation = useNavigation();
    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMembers = async () => {
        try {
            setError(null);
            const emp_id = store.getState().auth.user?.emp_id || 2; // Fallback to 2 if not available

            const response = await authClient.post<ApiResponse>(
                APIEndpoints.allActiveMemberList,
                { emp_id }
            );

            if (response.data.status === 'success') {
                setMembers(response.data.data);
                setFilteredMembers(response.data.data);
            } else {
                throw new Error('Failed to fetch members');
            }
        } catch (error: any) {
            console.error('Error fetching members:', error);

            if (error.response?.data) {
                // Handle API error responses
                setError(error.response.data.message || 'Failed to fetch members');

                if (error.response.status === 401) {
                    Alert.alert('Error', 'Unauthorized access. Please check your permissions.');
                } else if (error.response.data.message === 'Employee not found') {
                    Alert.alert('Error', 'Employee not found or insufficient permissions.');
                }
            } else if (error.request) {
                setError('Network error. Please check your connection.');
            } else {
                setError('Failed to fetch members. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setFilteredMembers(members);
        } else {
            const lowerQuery = query.toLowerCase();
            const filtered = members.filter(member => 
                member.member_name.toLowerCase().includes(lowerQuery) ||
                (member.email && member.email.toLowerCase().includes(lowerQuery)) ||
                member.contact.includes(query) ||
                (member.branch_name && member.branch_name.toLowerCase().includes(lowerQuery)) ||
                member.subscription.package_name.toLowerCase().includes(lowerQuery)
            );
            setFilteredMembers(filtered);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredMembers(members);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMembers();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const navigateToMemberDetails = (member: Member) => {
        navigation.navigate('MembersDetails', { member });
    };

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

    if (loading && members.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>MEMBERS</Text>
                    <View style={styles.refreshButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E4D" />
                    <Text style={styles.loadingText}>Loading team members...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>MEMBERS</Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    style={styles.refreshButton}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#075E4D" />
                    ) : (
                        <MaterialIcons
                            name="refresh"
                            size={26}
                            color={"#075E4D"}
                        />
                    )}
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email, phone, branch, or package..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Members List */}
            <ScrollView
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#075E4D']}
                        tintColor="#075E4D"
                    />
                }
            >
                {filteredMembers.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {searchQuery.trim() !== '' 
                                ? 'No matching members found' 
                                : 'No team members found'
                            }
                        </Text>
                        {searchQuery.trim() !== '' ? (
                            <TouchableOpacity onPress={clearSearch} style={styles.retryButton}>
                                <Text style={styles.retryText}>Clear Search</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredMembers.map((member) => (
                        <TouchableOpacity
                            key={member.member_id}
                            style={styles.memberCard}
                            onPress={() => navigateToMemberDetails(member)}
                        >
                            <View style={styles.avatarContainer}>
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {getInitials(member.member_name)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.member_name}</Text>

                                <View style={styles.detailRow}>
                                    <Ionicons name="business-outline" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {member.branch_name || 'No branch assigned'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="call-outline" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {formatPhoneNumber(member.contact)}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="card-outline" size={14} color="#666" />
                                    <Text style={styles.detailText}>
                                        {member.subscription.package_name}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.arrowContainer}>
                                <MaterialIcons name="arrow-forward-ios" size={18} color="#075E4D" />
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 50 : 35,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
        flex: 1,
        textAlign: 'center',
        marginLeft: -26,
        color: '#000',
    },
    refreshButton: {
        padding: 8,
        width: 42,
    },
    // Search Styles
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    memberCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
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
    avatarContainer: {
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#075E4D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#666',
        flexShrink: 1,
    },
    arrowContainer: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#075E4D',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
    },
    errorText: {
        marginLeft: 8,
        color: '#D32F2F',
        fontSize: 14,
        flex: 1,
    },
});

export default MembersScreen;