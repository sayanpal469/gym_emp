import { useState, useEffect, useCallback } from 'react';

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Toast from 'react-native-toast-message';
import { baseClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';

interface TrialAssignment {
  id: number;
  member_id: number;
  trainer_id: number;
  trainer_name: string;
  trial_date: string;
  trial_time: string | null;
  note: string | null;
  status: number;
  created_at: string;
  member_name: string;
  phone: string;
  status_name: string;
}

interface GetTrialsByTrainerResponse {
  status: boolean;
  code: number;
  message: string;
  data: TrialAssignment[];
}

interface GetTrialsByTrainerPayload {
  trainer_id: number;
}

export const useTrialService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trials, setTrials] = useState<TrialAssignment[]>([]);

  const { userId } = useSelector((state: RootState) => state.auth);

  const fetchTrialsByTrainer = useCallback(async () => {
    if (!userId) {
      setError('Trainer ID not found');
      return { success: false, data: [] };
    }

    setLoading(true);
    setError(null);

    try {
      const payload: GetTrialsByTrainerPayload = {
        trainer_id: userId,
      };

      const response = await baseClient.post<GetTrialsByTrainerResponse>(
        APIEndpoints.getTrialsByTrainer,
        payload,
      );

      if (response.data?.status === true) {
        setTrials(response.data.data);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.data.message || 'Trials fetched successfully',
        });

        return { success: true, data: response.data.data };
      } else {
        const errMsg = response.data?.message || 'Failed to fetch trials';
        setError(errMsg);

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errMsg,
        });

        return { success: false, data: [] };
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong';
      setError(errMsg);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });

      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(() => {
    return fetchTrialsByTrainer();
  }, [fetchTrialsByTrainer]);

  // Fetch trials on initial load
  useEffect(() => {
    if (userId) {
      fetchTrialsByTrainer();
    }
  }, [userId, fetchTrialsByTrainer]);

  return {
    loading,
    error,
    trials,
    fetchTrialsByTrainer,
    refetch,
  };
};
