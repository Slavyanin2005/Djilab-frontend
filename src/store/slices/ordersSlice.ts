import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Order } from '../../types';

type OrderStatus = 'draft' | 'formed' | 'completed' | 'rejected' | 'deleted';

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  statusFilter: OrderStatus | '';
  dateFrom: string;
  dateTo: string;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  statusFilter: '',
  dateFrom: '',
  dateTo: '',
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchOrders = createAsyncThunk<Order[], void>(
  'orders/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { statusFilter, dateFrom, dateTo } = (getState() as any).orders;
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      return await api.getOrders(params);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk<Order, number>(
  'orders/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      return await api.getOrderDetails(orderId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk<Order, { id: number; status: OrderStatus }>(
  'orders/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await api.changeOrderStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addOrderComment = createAsyncThunk<Order, { id: number; comment: string }>(
  'orders/addComment',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      return await api.addOrderComment(id, comment);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<Pick<OrdersState, 'statusFilter' | 'dateFrom' | 'dateTo'>>>
    ) => {
      return { ...state, ...action.payload };
    },
    clearFilters: (state) => {
      state.statusFilter = '';
      state.dateFrom = '';
      state.dateTo = '';
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    // ✅ Добавляем очистку заказов
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.error = null;
      state.statusFilter = '';
      state.dateFrom = '';
      state.dateTo = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addOrderComment.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.orders[idx] = action.payload;
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  setCurrentOrder,
  clearCurrentOrder,
  clearOrders, // ✅ Экспортируем
} = ordersSlice.actions;

export default ordersSlice.reducer;
