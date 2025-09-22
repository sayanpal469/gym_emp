import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Address {
  address: string;
  location: string;
  country: string;
  state: string;
  city: string;
  pin: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  lat: string;
  lng: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  phone?: string | null;
  email?: string | null;
  token?: string | null;
  userName?: string | null;
  image?: string | null;
  role?: string | null;
  status?: string | null;
  address?: Address;
  branches: Branch[];
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  phone: null,
  email: null,
  token: null,
  userName: null,
  image: null,
  role: null,
  status: null,
  address: {
    address: '',
    location: '',
    country: '',
    state: '',
    city: '',
    pin: '',
  },
  branches: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        token: string;
        employee: {
          employee_id: number;
          first_name: string;
          last_name: string;
          phone_number: string;
          role: string;
          status: string;
          profile_picture: string | null;
          branches: Branch[];
        };
      }>
    ) {
      const { token, employee } = action.payload;

      state.isAuthenticated = true;
      state.token = token;
      state.userId = employee.employee_id;
      state.userName = `${employee.first_name} ${employee.last_name}`;
      state.phone = employee.phone_number;
      state.image = employee.profile_picture;
      state.role = employee.role;
      state.status = employee.status;
      state.branches = employee.branches;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.phone = null;
      state.email = null;
      state.token = null;
      state.userName = null;
      state.image = null;
      state.role = null;
      state.status = null;
      state.address = {
        address: '',
        location: '',
        country: '',
        state: '',
        city: '',
        pin: '',
      };
      state.branches = [];
    },

    updateAddress(state, action: PayloadAction<Address>) {
      state.address = action.payload;
    },
  },
});

export const { login, logout, updateAddress } = authSlice.actions;

export default authSlice.reducer;
