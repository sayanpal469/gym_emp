import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BranchesScreen = ({ navigation }: any) => {
    const [selectedBranch, setSelectedBranch] = useState('Branch 1');
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const branches = [
        { id: '1', name: 'Branch 1', address: '123 Main Street' },
        { id: '2', name: 'Branch 2', address: '456 Oak Avenue' },
        { id: '3', name: 'Branch 3', address: '789 Pine Road' },
        { id: '4', name: 'Branch 4', address: '321 Elm Street' },
    ];

    const handleBranchSelect = (branch: any) => {
        setSelectedBranch(branch.name);
        setDropdownVisible(false);
        // Here you would typically update the branch in your state/API
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Branches</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.subtitle}>Current Branch</Text>

                {/* Branch Selector */}
                <TouchableOpacity
                    style={styles.branchSelector}
                    onPress={() => setDropdownVisible(true)}
                >
                    <View style={styles.branchInfo}>
                        <MaterialIcons name="store" size={24} color="#075E4D" />
                        <View style={styles.branchText}>
                            <Text style={styles.branchName}>{selectedBranch}</Text>
                            <Text style={styles.branchAddress}>
                                {branches.find(b => b.name === selectedBranch)?.address}
                            </Text>
                        </View>
                    </View>
                    <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>

                {/* Branch List */}
                <View style={styles.branchList}>
                    <Text style={styles.sectionTitle}>All Branches</Text>
                    {branches.map((branch) => (
                        <View key={branch.id} style={styles.branchCard}>
                            <MaterialIcons name="store" size={28} color="#075E4D" />
                            <View style={styles.branchDetails}>
                                <Text style={styles.branchCardName}>{branch.name}</Text>
                                <Text style={styles.branchCardAddress}>{branch.address}</Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.selectButton,
                                    selectedBranch === branch.name && styles.selectedButton
                                ]}
                                onPress={() => handleBranchSelect(branch)}
                            >
                                <Text style={[
                                    styles.selectButtonText,
                                    selectedBranch === branch.name && styles.selectedButtonText
                                ]}>
                                    {selectedBranch === branch.name ? 'Selected' : 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Dropdown Modal */}
            <Modal
                visible={isDropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownTitle}>Select Branch</Text>
                    {branches.map((branch) => (
                        <TouchableOpacity
                            key={branch.id}
                            style={styles.dropdownItem}
                            onPress={() => handleBranchSelect(branch)}
                        >
                            <Text style={styles.dropdownItemText}>{branch.name}</Text>
                            <Text style={styles.dropdownItemAddress}>{branch.address}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
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
    placeholder: {
        width: 40,
    },
    container: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    branchSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f9f7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
    },
    branchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    branchText: {
        marginLeft: 12,
    },
    branchName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#075E4D',
    },
    branchAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    branchList: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    branchCard: {
        flexDirection: 'row',
        alignItems: 'center',
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
    branchDetails: {
        flex: 1,
        marginLeft: 12,
    },
    branchCardName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    branchCardAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    selectButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    selectedButton: {
        backgroundColor: '#075E4D',
    },
    selectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedButtonText: {
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownContainer: {
        position: 'absolute',
        top: '20%',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    dropdownTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    dropdownItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dropdownItemAddress: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});

export default BranchesScreen;