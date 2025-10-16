import React, { useState, useEffect, useRef } from 'react';
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
    Image,
    TextInput,
    Platform,
    Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { authClient } from '../../services/api.clients';
import { APIEndpoints } from '../../services/api.endpoints';
import { store } from '../../redux/store';

const screenWidth = Dimensions.get('window').width;

interface Member {
    id: number;
    name: string;
    branch: string;
    role: string;
    phone: string;
    avatar?: string;
}

interface ApiEmployee {
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    branch_name: string;
    branch_address: string;
    profile_picture: string | null;
    shift_start: string;
    shift_end: string;
}

const StuffScreen = () => {
    const navigation = useNavigation();
    const [members, setMembers] = useState<Member[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('All');
    const [availableRoles, setAvailableRoles] = useState<string[]>(['All']);
    const [searchQuery, setSearchQuery] = useState('');
    
    const tabsScrollViewRef = useRef<ScrollView>(null);
    const tabPositions = useRef<{[key: string]: number}>({});

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const empId = store.getState().auth.user?.employee_id || 2;

            const response = await authClient.post(APIEndpoints.getAllEmployeeList, {
                emp_id: empId
            });

            if (response.data.status === 'success') {
                const apiEmployees: ApiEmployee[] = response.data.data;

                const transformedMembers: Member[] = apiEmployees.map(emp => ({
                    id: parseInt(emp.employee_id),
                    name: `${emp.first_name} ${emp.last_name}`.trim(),
                    branch: emp.branch_name,
                    role: emp.role,
                    phone: emp.phone_number,
                    avatar: emp.profile_picture || undefined
                }));

                setMembers(transformedMembers);
                setFilteredMembers(transformedMembers);
                
                const roles = ['All', ...new Set(transformedMembers.map(member => member.role))];
                setAvailableRoles(roles);
            } else {
                console.error('API returned error status:', response.data);
                setMembers([]);
                setFilteredMembers([]);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
            setFilteredMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const filterMembers = (role: string, query: string) => {
        let filtered = members;

        // Filter by role
        if (role !== 'All') {
            filtered = filtered.filter(member => member.role === role);
        }

        // Filter by search query
        if (query.trim() !== '') {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(member => 
                member.name.toLowerCase().includes(lowerQuery) ||
                member.branch.toLowerCase().includes(lowerQuery) ||
                member.role.toLowerCase().includes(lowerQuery) ||
                member.phone.includes(query)
            );
        }

        setFilteredMembers(filtered);
    };

    const filterMembersByRole = (role: string) => {
        setActiveTab(role);
        filterMembers(role, searchQuery);
        
        // Scroll to the selected tab
        setTimeout(() => {
            if (tabPositions.current[role] !== undefined && tabsScrollViewRef.current) {
                tabsScrollViewRef.current.scrollTo({
                    x: tabPositions.current[role] - 50, // Offset for better visibility
                    animated: true
                });
            }
        }, 100);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        filterMembers(activeTab, query);
    };

    const clearSearch = () => {
        setSearchQuery('');
        filterMembers(activeTab, '');
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMembers();
        setRefreshing(false);
    };

    // Measure tab positions for scrolling
    const onTabLayout = (role: string, event: any) => {
        const { x } = event.nativeEvent.layout;
        tabPositions.current[role] = x;
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const navigateToMemberDetails = (member: Member) => {
        navigation.navigate('StuffDetails', { employeeId: member.id });
    };

    if (loading && members.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>STUFFS</Text>
                    <View style={styles.refreshButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E4D" />
                    <Text style={styles.loadingText}>Loading staff members...</Text>
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
                <Text style={styles.title}>STUFFS</Text>
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
                        placeholder="Search by name, branch, role, or phone..."
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

            {/* Role Tabs */}
            <View style={styles.tabsWrapper}>
                <ScrollView 
                    ref={tabsScrollViewRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsContainer}
                    contentContainerStyle={styles.tabsContentContainer}
                    bounces={false}
                    decelerationRate="fast"
                    snapToAlignment="center"
                >
                    {availableRoles.map((role) => (
                        <TouchableOpacity
                            key={role}
                            style={[
                                styles.tab,
                                activeTab === role && styles.activeTab
                            ]}
                            onPress={() => filterMembersByRole(role)}
                            onLayout={(event) => onTabLayout(role, event)}
                        >
                            <Text 
                                style={[
                                    styles.tabText,
                                    activeTab === role && styles.activeTabText
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                {/* Gradient overlay for scroll indication */}
                <View style={styles.scrollIndicatorRight} />
                <View style={styles.scrollIndicatorLeft} />
            </View>

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
                                ? 'No matching results found' 
                                : activeTab === 'All' 
                                    ? 'No team members found' 
                                    : `No ${activeTab} members found`
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
                            key={member.id}
                            style={styles.memberCard}
                            onPress={() => navigateToMemberDetails(member)}
                        >
                            <View style={styles.avatarContainer}>
                                {member.avatar ? (
                                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <View style={styles.detailRow}>
                                    <Ionicons name="business-outline" size={14} color="#666" />
                                    <Text style={styles.detailText}>{member.branch}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name="briefcase-outline" size={14} color="#666" />
                                    <Text style={styles.detailText}>{member.role}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons name="call-outline" size={14} color="#666" />
                                    <Text style={styles.detailText}>{member.phone}</Text>
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
    // Tabs Wrapper
    tabsWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    tabsContainer: {
        maxHeight: 50,
        flexGrow: 0,
    },
    tabsContentContainer: {
        paddingHorizontal: 12,
        alignItems: 'center',
        paddingRight: 24, // Extra padding for last tab
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 6,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        minWidth: 80,
        maxWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 1,
    },
    activeTab: {
        backgroundColor: '#075E4D',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    activeTabText: {
        color: '#fff',
    },
    // Scroll indicators
    scrollIndicatorRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 20,
        backgroundColor: 'linear-gradient(90deg, transparent 0%, #fff 100%)',
    },
    scrollIndicatorLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 20,
        backgroundColor: 'linear-gradient(270deg, transparent 0%, #fff 100%)',
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
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
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
});

export default StuffScreen;