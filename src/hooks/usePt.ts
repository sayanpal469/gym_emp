import { useState } from 'react';
import { baseClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface GetPtPayload {
  trainer_id: number;
}

export const usePt = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useSelector((state: RootState) => state.auth);

  // Fetch all PT subscriptions for a trainer
  const getAllPt = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.pt, {
        trainer_id: userId,
      });
      const { status, message, data, date } = response.data;

      if (status === true) {
        Toast.show({
          type: 'success',
          text1: 'PT Data Loaded',
          text2: `Data as of ${date || 'today'}`,
        });

        return { success: true, data };
      } else {
        const errMsg = message || 'Failed to fetch PT subscriptions';
        setError(errMsg);

        Toast.show({
          type: 'error',
          text1: 'Fetch Failed',
          text2: errMsg,
        });

        return { success: false };
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong';
      setError(errMsg);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });

      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    getAllPt,
    loading,
    error,
  };
};
