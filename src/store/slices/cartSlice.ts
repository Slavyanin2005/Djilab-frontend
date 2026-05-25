import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import type { Order, OrderItem } from '../../types';

export interface CartState {
  draftOrder: Order | null;
  items: OrderItem[];
  itemsCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  draftOrder: null,
  items: [],
  itemsCount: 0,
  loading: false,
  error: null,
};

export const loadCart = createAsyncThunk<Order | null, void>(
  'cart/load',
  async (_, { rejectWithValue }) => {
    try {
      const cartInfo = await api.getCartIcon();
      if (cartInfo.id) {
        return await api.getOrder(cartInfo.id);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk<Order, { serviceId: number; quantity: number }>(
  'cart/add',
  async ({ serviceId, quantity }, { rejectWithValue }) => {
    try {
      return await api.addToOrder(serviceId, quantity);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuantity = createAsyncThunk<
  Order,
  { orderId: number; serviceId: number; action: 'increase' | 'decrease'; currentQty: number }
>('cart/updateQty', async ({ orderId, serviceId, action, currentQty }, { rejectWithValue }) => {
  try {
    const newQty = action === 'increase' ? currentQty + 1 : Math.max(1, currentQty - 1);
    return await api.updateOrderItem(orderId, serviceId, newQty);
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const removeItem = createAsyncThunk<Order, { orderId: number; serviceId: number }>(
  'cart/removeItem',
  async ({ orderId, serviceId }, { rejectWithValue }) => {
    try {
      return await api.removeItemFromOrder(orderId, serviceId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk<Order, number>(
  'cart/delete',
  async (orderId, { rejectWithValue }) => {
    try {
      return await api.deleteOrder(orderId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const formOrder = createAsyncThunk<Order, number>(
  'cart/formOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      return await api.formOrder(orderId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.draftOrder = null;
      state.items = [];
      state.itemsCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.draftOrder = action.payload;
          state.items = action.payload.items || [];
          state.itemsCount = action.payload.items_count;
        } else {
          state.draftOrder = null;
          state.items = [];
          state.itemsCount = 0;
        }
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.draftOrder = action.payload;
        state.items = action.payload.items || [];
        state.itemsCount = action.payload.items_count;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.draftOrder = action.payload;
        state.items = action.payload.items || [];
        state.itemsCount = action.payload.items_count;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.draftOrder = action.payload;
        state.items = action.payload.items || [];
        state.itemsCount = action.payload.items_count;
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.draftOrder = null;
        state.items = [];
        state.itemsCount = 0;
      })
      .addCase(formOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(formOrder.fulfilled, (state) => {
        state.loading = false;
        state.draftOrder = null;
        state.items = [];
        state.itemsCount = 0;
      })
      .addCase(formOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
