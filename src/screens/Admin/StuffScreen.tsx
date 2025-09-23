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
    Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { authClient } from '../../services/api.clients'; // Adjust path as needed
import { APIEndpoints } from '../../services/api.endpoints'; // Adjust path as needed
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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Get employee ID from Redux store (assuming it's stored there)
            const empId = store.getState().auth.user?.employee_id || 2; // Fallback to 2 if not available

            const response = await authClient.post(APIEndpoints.getAllEmployeeList, {
                emp_id: empId
            });

            if (response.data.status === 'success') {
                const apiEmployees: ApiEmployee[] = response.data.data;

                // Transform API data to match our Member interface
                const transformedMembers: Member[] = apiEmployees.map(emp => ({
                    id: parseInt(emp.employee_id),
                    name: `${emp.first_name} ${emp.last_name}`.trim(),
                    branch: emp.branch_name,
                    role: emp.role,
                    phone: emp.phone_number,
                    avatar: emp.profile_picture || undefined
                }));

                setMembers(transformedMembers);
            } else {
                console.error('API returned error status:', response.data);
                setMembers([]);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMembers();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // In MembersScreen.tsx
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
                    <Text style={styles.title}>STUFF LIST</Text>
                    <View style={styles.refreshButton} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E4D" />
                    <Text style={styles.loadingText}>Loading stuff members...</Text>
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
                <Text style={styles.title}>STUFF LIST</Text>
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
                {members.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No team members found</Text>
                        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    members.map((member) => (
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
        paddingTop: 35,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 10,
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
    // Details Screen Styles
    detailsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    detailsAvatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    detailsAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    detailsAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    detailsAvatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30,
    },
    detailsName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 12,
        color: '#333',
    },
    detailsRole: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    infoCard: {
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    infoCardText: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
});

export default StuffScreen;