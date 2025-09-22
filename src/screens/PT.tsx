import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PT = ({ navigation }: any) => {
  const [showBMIOptions, setShowBMIOptions] = useState(true);
  const [showProgressOptions, setShowProgressOptions] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>PT REPORTS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* BMI Report */}
        <View style={styles.optionCard}>
          <TouchableOpacity
            style={styles.optionHeader}
            onPress={() => setShowBMIOptions(prev => !prev)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="scale-bathroom" size={22} color="#075E4D" />
            </View>
            <Text style={styles.optionText}>BMI Report</Text>
            <MaterialCommunityIcons
              name={showBMIOptions ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#999"
            />
          </TouchableOpacity>

          {showBMIOptions && (
            <View style={styles.simpleButtons}>
              <TouchableOpacity style={styles.simpleButton}>
                <MaterialCommunityIcons name="file-plus-outline" size={18} color="#fff" />
                <Text style={styles.simpleButtonText}>Generate Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.simpleButton, { backgroundColor: '#2563EB' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#fff" />
                <Text style={styles.simpleButtonText}>View Reports</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Daily Progress Report */}
        <View style={styles.optionCard}>
          <TouchableOpacity
            style={styles.optionHeader}
            onPress={() => setShowProgressOptions(prev => !prev)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="chart-line" size={22} color="#075E4D" />
            </View>
            <Text style={styles.optionText}>Daily Progress Report</Text>
            <MaterialCommunityIcons
              name={showProgressOptions ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#999"
            />
          </TouchableOpacity>

          {showProgressOptions && (
            <View style={styles.simpleButtons}>
              <TouchableOpacity style={styles.simpleButton}>
                <MaterialCommunityIcons name="file-plus-outline" size={18} color="#fff" />
                <Text style={styles.simpleButtonText}>Generate Report</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.simpleButton, { backgroundColor: '#2563EB' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#fff" />
                <Text style={styles.simpleButtonText}>View Reports</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PT;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 35,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 4,
  },
  container: {
    padding: 20,
  },
  optionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#E0F2F1',
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  simpleButtons: {
    marginTop: 16,
    gap: 12,
  },
  simpleButton: {
    backgroundColor: '#075E4D',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  simpleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
