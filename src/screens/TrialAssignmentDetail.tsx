import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const PRIMARY_COLOR = '#075e4d';
const SECONDARY_COLOR = '#0a7a63';
const LIGHT_BG = '#e8f5f2';
const CARD_BG = '#ffffff';
const SUCCESS_COLOR = '#10b981';
const WARNING_COLOR = '#f59e0b';
const DANGER_COLOR = '#ef4444';

const TrialAssignmentDetail = ({ navigation, route }: any) => {
    const [showActionModal, setShowActionModal] = useState(false);

    // Mock data - in real app, get from route.params or API
    const memberDetails = {
        id: 1,
        memberName: 'Ram Kumar Das',
        email: 'ram.kumar@example.com',
        phone: '+91 98765 43210',
        assignDate: '5 Apr 2025',
        joiningDate: '5 Apr 2025',
        trialCount: 3,
        status: 'active',
        trainerName: 'John Smith',
        membershipType: 'Premium',
        address: '123 MG Road, Siliguri, West Bengal',
        emergencyContact: '+91 98765 12345',
        bloodGroup: 'O+',
        age: 28,
        gender: 'Male',
    };

    const trialHistory = [
        { id: 1, date: '5 Apr 2025', session: 'Morning', attendance: 'Present', time: '6:00 AM' },
        { id: 2, date: '6 Apr 2025', session: 'Morning', attendance: 'Present', time: '6:00 AM' },
        { id: 3, date: '7 Apr 2025', session: 'Morning', attendance: 'Pending', time: '6:00 AM' },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present':
                return SUCCESS_COLOR;
            case 'absent':
                return DANGER_COLOR;
            case 'pending':
                return WARNING_COLOR;
            default:
                return '#666';
        }
    };

    const ActionButton = ({ icon, label, onPress, color }: any) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />

            {/* Header with Gradient */}
            <LinearGradient
                colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Trial Details</Text>
                        <Text style={styles.subtitle}>Member Information</Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                        style={styles.profileAvatar}
                    >
                        <Text style={styles.avatarText}>
                            {memberDetails.memberName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </Text>
                    </LinearGradient>
                    <Text style={styles.profileName}>{memberDetails.memberName}</Text>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: SUCCESS_COLOR }]} />
                        <Text style={styles.statusText}>Active Trial Member</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Ionicons name="fitness" size={24} color={PRIMARY_COLOR} />
                        <Text style={styles.statValue}>{memberDetails.trialCount}</Text>
                        <Text style={styles.statLabel}>Trials Left</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Ionicons name="calendar-outline" size={24} color={PRIMARY_COLOR} />
                        <Text style={styles.statValue}>
                            {trialHistory.filter(h => h.attendance === 'Present').length}
                        </Text>
                        <Text style={styles.statLabel}>Attended</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Ionicons name="trophy" size={24} color={PRIMARY_COLOR} />
                        <Text style={styles.statValue}>
                            {Math.round((trialHistory.filter(h => h.attendance === 'Present').length / trialHistory.length) * 100)}%
                        </Text>
                        <Text style={styles.statLabel}>Attendance</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <ActionButton
                        icon="call"
                        label="Call"
                        color={PRIMARY_COLOR}
                        onPress={() => { }}
                    />
                    <ActionButton
                        icon="mail"
                        label="Email"
                        color="#3b82f6"
                        onPress={() => { }}
                    />
                    <ActionButton
                        icon="chatbubble"
                        label="Message"
                        color="#8b5cf6"
                        onPress={() => { }}
                    />
                    <ActionButton
                        icon="person-add"
                        label="Convert"
                        color={SUCCESS_COLOR}
                        onPress={() => setShowActionModal(true)}
                    />
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="person" size={20} color={PRIMARY_COLOR} />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <InfoRow icon="mail-outline" label="Email" value={memberDetails.email} />
                        <InfoRow icon="call-outline" label="Phone" value={memberDetails.phone} />
                        <InfoRow icon="calendar-outline" label="Age" value={`${memberDetails.age} years`} />
                        <InfoRow icon="male-female-outline" label="Gender" value={memberDetails.gender} />
                        <InfoRow icon="water-outline" label="Blood Group" value={memberDetails.bloodGroup} />
                        <InfoRow icon="location-outline" label="Address" value={memberDetails.address} />
                        <InfoRow icon="alert-circle-outline" label="Emergency" value={memberDetails.emergencyContact} />
                    </View>
                </View>

                {/* Trial Information */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle" size={20} color={PRIMARY_COLOR} />
                        <Text style={styles.sectionTitle}>Trial Information</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <InfoRow icon="calendar" label="Assigned Date" value={memberDetails.assignDate} />
                        <InfoRow icon="calendar-outline" label="Joining Date" value={memberDetails.joiningDate} />
                        <InfoRow icon="person-outline" label="Trainer" value={memberDetails.trainerName} />
                        <InfoRow icon="ribbon-outline" label="Membership Type" value={memberDetails.membershipType} />
                    </View>
                </View>

                {/* Trial History */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="time" size={20} color={PRIMARY_COLOR} />
                        <Text style={styles.sectionTitle}>Trial History</Text>
                    </View>
                    {trialHistory.map((trial) => (
                        <View key={trial.id} style={styles.historyCard}>
                            <View style={styles.historyLeft}>
                                <View style={styles.historyDate}>
                                    <Text style={styles.historyDay}>
                                        {new Date(trial.date).getDate()}
                                    </Text>
                                    <Text style={styles.historyMonth}>
                                        {new Date(trial.date).toLocaleDateString('en', { month: 'short' })}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.historyContent}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.historySession}>{trial.session} Session</Text>
                                    <View style={[styles.historyStatus, { backgroundColor: getStatusColor(trial.attendance) + '20' }]}>
                                        <Text style={[styles.historyStatusText, { color: getStatusColor(trial.attendance) }]}>
                                            {trial.attendance}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.historyMeta}>
                                    <Ionicons name="time-outline" size={14} color="#666" />
                                    <Text style={styles.historyTime}>{trial.time}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Convert to Member Button */}
                <TouchableOpacity
                    style={styles.convertButton}
                    onPress={() => setShowActionModal(true)}
                >
                    <LinearGradient
                        colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.convertGradient}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.convertText}>Convert to Full Member</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Action Modal */}
            <Modal
                visible={showActionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowActionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="person-add" size={32} color={PRIMARY_COLOR} />
                            <Text style={styles.modalTitle}>Convert to Member</Text>
                            <Text style={styles.modalSubtitle}>
                                Convert {memberDetails.memberName} to a full member?
                            </Text>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalButtonSecondary}
                                onPress={() => setShowActionModal(false)}
                            >
                                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButtonPrimary}
                                onPress={() => {
                                    setShowActionModal(false);
                                    // Handle conversion logic
                                }}
                            >
                                <LinearGradient
                                    colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                                    style={styles.modalButtonGradient}
                                >
                                    <Text style={styles.modalButtonPrimaryText}>Confirm</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
            <Ionicons name={icon} size={18} color="#666" />
            <Text style={styles.infoLabel}>{label}</Text>
        </View>
        <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
);

export default TrialAssignmentDetail;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: LIGHT_BG,
    },
    headerGradient: {
        paddingTop: 10,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    moreButton: {
        padding: 8,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    profileCard: {
        backgroundColor: CARD_BG,
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: SUCCESS_COLOR + '15',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: SUCCESS_COLOR + '30',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: SUCCESS_COLOR,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        gap: 10,
    },
    statBox: {
        flex: 1,
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: CARD_BG,
        borderRadius: 12,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    actionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    section: {
        marginTop: 20,
        marginHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginLeft: 8,
    },
    infoCard: {
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
    historyCard: {
        flexDirection: 'row',
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    historyLeft: {
        marginRight: 16,
    },
    historyDate: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: LIGHT_BG,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: PRIMARY_COLOR + '30',
    },
    historyDay: {
        fontSize: 18,
        fontWeight: '700',
        color: PRIMARY_COLOR,
    },
    historyMonth: {
        fontSize: 11,
        fontWeight: '600',
        color: PRIMARY_COLOR,
        textTransform: 'uppercase',
    },
    historyContent: {
        flex: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    historySession: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    historyStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    historyStatusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    historyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyTime: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    convertButton: {
        marginHorizontal: 16,
        marginTop: 24,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    convertGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    convertText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: CARD_BG,
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginTop: 12,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButtonSecondary: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: PRIMARY_COLOR,
        alignItems: 'center',
    },
    modalButtonSecondaryText: {
        fontSize: 15,
        fontWeight: '600',
        color: PRIMARY_COLOR,
    },
    modalButtonPrimary: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    modalButtonPrimaryText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});