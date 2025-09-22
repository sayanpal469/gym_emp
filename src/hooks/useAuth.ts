import { useState } from 'react';
import { baseClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import Toast from 'react-native-toast-message';

type LoginPayload = {
  phone_number: string;
  password: string;
};

interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  dob: string;
}

interface OtpVerificationPayload {
  phone: string;
  otp: string;
}

interface ResendOtpPayload {
  phone: string;
}
interface ForgotPasswordPayload {
  phone: string;
}

interface ResetPasswordPayload {
  phone: string;
  new_password: string;
}

export const useAuth = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (credentials: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.logIn, {
        phone_number: credentials.phone_number,
        password: credentials.password,
      });

      if (response.data?.status === true) {
        const { token, employee } = response.data;

        dispatch(
          login({
            token,
            employee,
          }),
        );

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back!',
        });

        return { success: true };
      } else {
        const errMsg = response.data?.message || 'Login failed';
        setError(errMsg);

        Toast.show({
          type: 'error',
          text1: 'Login Failed',
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

  const registerUser = async (data: RegisterPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.register, data);

      if (response.data?.status === true) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: response.data?.message || 'Welcome aboard!',
        });

        return { success: true };
      } else {
        const errMsg = response.data?.message || 'Registration failed';
        setError(errMsg);

        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
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

  const verifyOtp = async (payload: OtpVerificationPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.otpVerify, payload);

      const { status, message } = response.data;

      if (status === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: message || 'Verification successful.',
        });

        return { success: true };
      } else {
        setError(message || 'OTP verification failed');

        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: message || 'Invalid OTP or phone number',
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

  const resendOtp = async (payload: ResendOtpPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(APIEndpoints.otpResend, payload);

      const { status, message } = response.data;

      if (status === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: message || 'A new OTP has been sent to your phone.',
        });

        return { success: true };
      } else {
        setError(message || 'Failed to resend OTP');

        Toast.show({
          type: 'error',
          text1: 'Resend Failed',
          text2: message || 'Could not resend OTP.',
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

  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.forgotPassWord,
        payload,
      );
      const { status, message, otp } = response.data;

      if (status === true) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: message || 'OTP has been sent to your phone.',
        });

        return {
          success: true,
          otp, // you may want to return it for development/testing
        };
      } else {
        setError(message || 'Failed to send OTP');

        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2: message || 'Unable to process forgot password request.',
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

  const resetPassword = async (payload: ResetPasswordPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await baseClient.post(
        APIEndpoints.resetPassWord,
        payload,
      );
      const { status, message } = response.data;

      if (status === true) {
        Toast.show({
          type: 'success',
          text1: 'Password Reset Successful',
          text2: message || 'Your password has been updated.',
        });

        return { success: true };
      } else {
        setError(message || 'Failed to reset password');

        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: message || 'Could not reset your password.',
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
    loginUser,
    registerUser,
    loading,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    error,
  };
};
