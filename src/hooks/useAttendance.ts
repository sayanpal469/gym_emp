import { useState } from 'react';
import { baseClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface AttendancePayload {
  emp_id: number | null;
  lat: number;
  lng: number;
  date: string;
  time: string;
}

interface LeavePayload {
  emp_id: number | null;
  reason: string;
  description: string;
  leave_for: number; // days or type of leave
  req_dt: string; // request date (YYYY-MM-DD)
}

interface EmpAttendancePayload {
  emp_id: number;
}

interface LeaveListPayload {
  emp_id: number;
}

interface AttendanceRecord {
  id: number;
  emp_id: number;
  lat: number;
  lng: number;
  date: string;
  job_start_time: string;
  job_end_time: string;
  type: string;
  created_at: string;
  attendanceStatus: string;
}

interface LeaveRecord {
  id: number;
  emp_id: number;
  reason: string;
  description: string;
  leave_for: number;
  req_dt: string;
  status: number;
  status_name: string;
}

interface EmpAttendanceResponse {
  status: string;
  employee_id: number;
  attendance: AttendanceRecord[];
}

interface LeaveListResponse {
  status: string;
  employee_id: number;
  leave_requests: LeaveRecord[];
}

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { userId } = useSelector((state: RootState) => state.auth);

  const giveAttendance = async (payload: AttendancePayload) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await baseClient.post(APIEndpoints.attendance, payload);

      const { status, message: responseMessage } = response.data;
      setMessage(responseMessage);

      if (status === true) {
        Toast.show({
          type: 'success',
          text1: 'Attendance Marked',
          text2: responseMessage || 'Attendance recorded successfully.',
        });

        return { success: true };
      } else {
        setError(responseMessage || 'Failed to mark attendance');

        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: responseMessage || 'Invalid employee ID or location.',
        });

        return { success: false };
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong';
      setError(errMsg);
      setMessage(errMsg);

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

  const requestLeave = async (payload: LeavePayload) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await baseClient.post(APIEndpoints.leave, payload);

      const { status, message: responseMessage } = response.data;
      setMessage(responseMessage);

      if (status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Leave Requested',
          text2: responseMessage || 'Leave request submitted successfully.',
        });

        return { success: true };
      } else {
        setError(responseMessage || 'Failed to request leave');

        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: responseMessage || 'Unable to process leave request.',
        });

        return { success: false };
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Something went wrong';
      setError(errMsg);
      setMessage(errMsg);

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

  const empAttendanceList = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = {
      emp_id: userId
    };

    try {
      const response = await baseClient.post(APIEndpoints.attendanceList, payload);

      const { status, employee_id, attendance } = response.data as EmpAttendanceResponse;

      if (status === 'success') {
        return { 
          success: true, 
          data: {
            employee_id,
            attendance
          }
        };
      } else {
        const errorMessage = 'Failed to fetch attendance list';
        setError(errorMessage);

        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: errorMessage,
        });

        return { success: false, data: null };
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Failed to fetch attendance list';
      setError(errMsg);
      setMessage(errMsg);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });

      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  const leaveList = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = {
      emp_id: userId
    };

    try {
      const response = await baseClient.post(APIEndpoints.leaveList, payload);

      const { status, employee_id, leave_requests } = response.data as LeaveListResponse;

      if (status === 'success') {
        return { 
          success: true, 
          data: {
            employee_id,
            leave_requests
          }
        };
      } else {
        const errorMessage = 'Failed to fetch leave requests';
        setError(errorMessage);

        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: errorMessage,
        });

        return { success: false, data: null };
      }
    } catch (err: any) {
      let errMsg = 'Failed to fetch leave requests';
      
      // Handle specific error cases
      if (err?.response?.status === 404) {
        errMsg = err?.response?.data?.message || 'No leave requests found';
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err?.message) {
        errMsg = err.message;
      }

      setError(errMsg);
      setMessage(errMsg);

      // Show toast for error responses
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });

      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    giveAttendance,
    requestLeave,
    empAttendanceList,
    leaveList, // ✅ New function to get employee leave requests
    loading,
    error,
    message,
  };
};