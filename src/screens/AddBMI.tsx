import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { baseClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';
import Toast from 'react-native-toast-message';

const AddBMIScreen = ({ route, navigation }: any) => {
  const { memberId, memberName } = route.params;
  const { userId } = useSelector((state: RootState) => state.auth);

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [loading, setLoading] = useState(false);
  
  // State for API response data
  const [bmiData, setBmiData] = useState<{
    value: number;
    category: string;
  } | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [bodyFatPercent, setBodyFatPercent] = useState<number | null>(null);
  const [idealBodyWeight, setIdealBodyWeight] = useState<number | null>(null);

  const categoryColors: Record<string, string> = {
    Normal: '#0f9d58',
    Overweight: '#f4b400',
    Obese: '#db4437',
    Underweight: '#4285f4',
  };

  const saveBMI = async () => {
    if (!height || !weight || !age) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill all fields before saving',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        trainer_id: userId,
        member_id: memberId,
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender: gender.toLowerCase()
      };

      const response = await baseClient.post(APIEndpoints.createBmi, payload);
      
      if (response.data.ok) {
        const { bmi, bmr, body_fat_percent, ideal_body_weight } = response.data;
        
        // Set all the response data
        setBmiData(bmi);
        setBmr(bmr);
        setBodyFatPercent(body_fat_percent);
        setIdealBodyWeight(ideal_body_weight);

        Toast.show({
          type: 'success',
          text1: 'Health Data Saved Successfully',
          text2: `BMI: ${bmi.value} (${bmi.category})`,
        });
        
        // Don't navigate back automatically - let user see the results
      } else {
        Toast.show({
          type: 'error',
          text1: 'Save Failed',
          text2: response.data.message || 'Failed to save health data',
        });
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>ADD HEALTH DATA</Text>
        <TouchableOpacity 
          disabled={loading} 
          onPress={saveBMI}
        >
          <Text style={[styles.saveText, { color: !loading ? '#075E4D' : '#aaa' }]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Member Info */}
        <View style={styles.memberCard}>
          <Text style={styles.memberName}>{memberName}</Text>

          {/* Gender Toggle */}
          <View style={styles.genderToggle}>
            {['Male', 'Female'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderButton,
                  gender === g && styles.genderButtonActive,
                ]}
                onPress={() => setGender(g as 'Male' | 'Female')}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === g && styles.genderTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Row Inputs */}
          <View style={styles.rowInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholder="Age"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholder="Height"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[
            styles.calcButton, 
            (!height || !weight || !age || loading) && styles.disabledButton
          ]} 
          onPress={saveBMI}
          disabled={!height || !weight || !age || loading}
        >
          <Text style={styles.calcButtonText}>
            {loading ? 'Calculating...' : 'Calculate & Save Health Data'}
          </Text>
        </TouchableOpacity>

        {/* Health Result Card */}
        {bmiData && (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.resultCard,
                { borderColor: categoryColors[bmiData.category] || '#777' },
              ]}
            >
              <Text style={styles.sectionTitle}>BMI Result</Text>
              <Text style={styles.bmiValue}>{bmiData.value.toFixed(1)}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryColors[bmiData.category] || '#777' },
                ]}
              >
                <Text style={styles.categoryText}>{bmiData.category}</Text>
              </View>
            </View>

            {/* Additional Health Metrics */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>BMR</Text>
                <Text style={styles.metricValue}>{bmr}</Text>
                <Text style={styles.metricUnit}>calories/day</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Body Fat</Text>
                <Text style={styles.metricValue}>{bodyFatPercent?.toFixed(1)}%</Text>
              </View>
              
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Ideal Weight</Text>
                <Text style={styles.metricValue}>{idealBodyWeight?.toFixed(1)}</Text>
                <Text style={styles.metricUnit}>kg</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 35,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#075E4D'
  },
  memberCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  memberName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#075E4D',
  },
  genderText: {
    fontSize: 14,
    color: '#555',
  },
  genderTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    textAlign: 'center',
  },
  calcButton: {
    backgroundColor: '#075E4D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  calcButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    marginTop: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  bmiValue: {
    fontSize: 46,
    fontWeight: '800',
    color: '#222',
  },
  categoryBadge: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    minWidth: '30%',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  metricUnit: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default AddBMIScreen;