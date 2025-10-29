import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const PRIMARY_COLOR = '#075e4d';
const SECONDARY_COLOR = '#0a7a63';
const LIGHT_BG = '#e8f5f2';
const CARD_BG = '#ffffff';

const NewTrialAssign = ({ navigation }: any) => {
    const trialAssignments = [
        {
            id: 1,
            memberName: 'Ram Kumar Das',
            assignDate: '5 Apr 2025',
            joiningDate: '5 Apr 2025',
            trialCount: 3,
            status: 'active',
        },
        {
            id: 2,
            memberName: 'Priya Sharma',
            assignDate: '4 Apr 2025',
            joiningDate: '6 Apr 2025',
            trialCount: 2,
            status: 'active',
        },
        {
            id: 3,
            memberName: 'Amit Patel',
            assignDate: '3 Apr 2025',
            joiningDate: '7 Apr 2025',
            trialCount: 1,
            status: 'active',
        },
    ];

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
                        <Text style={styles.title}>New Trial Assignments</Text>
                        <Text style={styles.subtitle}>Track and manage trials</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Cards Row */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="people" size={24} color={PRIMARY_COLOR} />
                        </View>
                        <Text style={styles.summaryValue}>{trialAssignments.length}</Text>
                        <Text style={styles.summaryLabel}>Total Trials</Text>
                    </View>
                    
                    <View style={styles.summaryCard}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="checkmark-done" size={24} color={PRIMARY_COLOR} />
                        </View>
                        <Text style={styles.summaryValue}>
                            {trialAssignments.filter(a => a.status === 'active').length}
                        </Text>
                        <Text style={styles.summaryLabel}>Active Now</Text>
                    </View>
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Assignments</Text>
                    <View style={styles.sectionDivider} />
                </View>

                {/* Trial Assignments List */}
                {trialAssignments.map((assignment, index) => (
                    <TouchableOpacity 
                        key={assignment.id} 
                        style={styles.listItem}
                        activeOpacity={0.7}
                        // onPress={() => navigation.navigate('TrialAssignmentDetail', { assignment })}
                    >
                        {/* Left Color Accent */}
                        <View style={styles.itemAccent} />
                        
                        {/* Avatar Circle */}
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={[PRIMARY_COLOR, SECONDARY_COLOR]}
                                style={styles.avatarGradient}
                            >
                                <Text style={styles.avatarText}>
                                    {assignment.memberName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </Text>
                            </LinearGradient>
                        </View>

                        {/* Content */}
                        <View style={styles.listContent}>
                            <View style={styles.nameRow}>
                                <Text style={styles.memberName}>{assignment.memberName}</Text>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{assignment.trialCount} Trials</Text>
                                </View>
                            </View>

                            <View style={styles.detailsContainer}>
                                <View style={styles.detailRow}>
                                    <View style={styles.detailIconWrapper}>
                                        <Ionicons name="calendar" size={14} color={PRIMARY_COLOR} />
                                    </View>
                                    <Text style={styles.detailLabel}>Assigned:</Text>
                                    <Text style={styles.detailValue}>{assignment.assignDate}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.detailIconWrapper}>
                                        <Ionicons name="calendar-outline" size={14} color={PRIMARY_COLOR} />
                                    </View>
                                    <Text style={styles.detailLabel}>Joining:</Text>
                                    <Text style={styles.detailValue}>{assignment.joiningDate}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Arrow Icon */}
                        {/* <MaterialIcons name="chevron-right" size={24} color="#ccc" /> */}
                    </TouchableOpacity>
                ))}

                {/* Empty State if needed */}
                {trialAssignments.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="clipboard-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No trial assignments yet</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewTrialAssign;

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
        paddingBottom: 20,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 12,
    },
    summaryCard: {
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
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: LIGHT_BG,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: '700',
        color: PRIMARY_COLOR,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    sectionDivider: {
        height: 3,
        width: 40,
        backgroundColor: PRIMARY_COLOR,
        borderRadius: 2,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    itemAccent: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: PRIMARY_COLOR,
    },
    avatarContainer: {
        marginRight: 14,
        marginLeft: 4,
    },
    avatarGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    listContent: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
    },
    badge: {
        backgroundColor: LIGHT_BG,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: PRIMARY_COLOR,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: PRIMARY_COLOR,
    },
    detailsContainer: {
        gap: 6,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIconWrapper: {
        width: 20,
        alignItems: 'center',
        marginRight: 6,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        marginRight: 6,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '600',
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