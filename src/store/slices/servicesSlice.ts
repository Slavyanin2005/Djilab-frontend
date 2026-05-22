// src/store/slices/servicesSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Service } from '../../types';

export interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    minPrice: string;
    maxPrice: string;
    category: string;
  };
}

const initialState: ServicesState = {
  services: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    category: '',
  },
};

// Async thunk для загрузки услуг
export const fetchServices = createAsyncThunk<
  Service[],
  void,
  { state: { services: ServicesState } }
>('services/fetchServices', async (_, { getState }) => {
  const { filters } = getState().services;
  const params: Record<string, string> = {};
  if (filters.search) params.search = filters.search;
  if (filters.minPrice) params.min_price = filters.minPrice;
  if (filters.maxPrice) params.max_price = filters.maxPrice;
  if (filters.category) params.category = filters.category;
  return await api.getServices(params);
});

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setMinPrice: (state, action: PayloadAction<string>) => {
      state.filters.minPrice = action.payload;
    },
    setMaxPrice: (state, action: PayloadAction<string>) => {
      state.filters.maxPrice = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        minPrice: '',
        maxPrice: '',
        category: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки';
      });
  },
});

export const { setSearch, setMinPrice, setMaxPrice, setCategory, resetFilters } =
  servicesSlice.actions;
export default servicesSlice.reducer;
