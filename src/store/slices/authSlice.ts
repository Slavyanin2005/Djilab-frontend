import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { User, RegisterData, UserProfile } from '../../types';

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  profileLoading: boolean;
  error: string | null;
  profileError: string | null;
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  profileLoading: false,
  error: null,
  profileError: null,
  registrationSuccess: false,
};

export const login = createAsyncThunk<User, { username: string; password: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await api.login(credentials.username, credentials.password);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка входа');
    }
  }
);

export const register = createAsyncThunk<User, RegisterData>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      return await api.register(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Ошибка регистрации');
    }
  }
);

export const checkAuth = createAsyncThunk<User | null, void>(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getCurrentUser();
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return null;
      }
      return rejectWithValue(error.message || 'Ошибка проверки авторизации');
    }
  }
);

export const logout = createAsyncThunk<void, void>('auth/logout', async () => {
  await api.logout();
});

export const fetchUserProfile = createAsyncThunk<UserProfile | null, void>(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getUserProfile();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk<
  UserProfile,
  Partial<Pick<UserProfile, 'phone' | 'company' | 'position'>>
>('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return await api.updateUserProfile(data);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const changePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string }
>('auth/changePassword', async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    await api.changeUserPassword(currentPassword, newPassword);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
        state.registrationSuccess = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state, _) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.registrationSuccess = true; //
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isInitialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.registrationSuccess = false;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { clearError, clearProfileError, clearRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer;
