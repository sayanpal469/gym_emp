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
    Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

interface Member {
    id: number;
    name: string;
    branch: string;
    phone: string;
    avatar?: string;
}

// Mock data for members
const mockMembers: Member[] = [
    {
        id: 1,
        name: 'John Smith',
        branch: 'Downtown Branch',
        phone: '+1 (555) 123-4567',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        branch: 'Westside Branch',
        phone: '+1 (555) 234-5678',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
    {
        id: 3,
        name: 'Michael Brown',
        branch: 'Uptown Branch',
        phone: '+1 (555) 345-6789',
    },
    {
        id: 4,
        name: 'Emily Davis',
        branch: 'Downtown Branch',
        phone: '+1 (555) 456-7890',
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
    {
        id: 5,
        name: 'Robert Wilson',
        branch: 'Westside Branch',
        phone: '+1 (555) 567-8901',
    },
    {
        id: 6,
        name: 'Jennifer Lee',
        branch: 'Uptown Branch',
        phone: '+1 (555) 678-9012',
        avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    },
];

const MembersScreen = () => {
    const navigation = useNavigation();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMembers = async () => {
        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
            setMembers(mockMembers);
            setLoading(false);
        }, 1000);
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

    if (loading && members.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>TEAM MEMBERS</Text>
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
                <Text style={styles.title}>TEAM MEMBERS</Text>
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
});

export default MembersScreen;