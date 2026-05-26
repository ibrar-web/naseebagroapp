import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CnicImage {
  uri: string;
  name: string;
}

export interface RegisterFormState {
  phone: string;
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  city: string;
  businessName: string;
  businessType: string;
  cnic: string;
  cnicFront: CnicImage | null;
  cnicBack: CnicImage | null;
  role: 'buyer' | 'seller';
}

const initialState: RegisterFormState = {
  phone: '',
  fullName: '',
  email: '',
  password: '',
  dateOfBirth: '',
  city: '',
  businessName: '',
  businessType: '',
  cnic: '',
  cnicFront: null,
  cnicBack: null,
  role: 'buyer',
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setRegisterPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setRegisterBasicInfo: (
      state,
      action: PayloadAction<{
        fullName: string;
        email: string;
        password: string;
        dateOfBirth: string;
      }>,
    ) => {
      state.fullName = action.payload.fullName;
      state.email = action.payload.email;
      state.password = action.payload.password;
      state.dateOfBirth = action.payload.dateOfBirth;
    },
    setRegisterBizInfo: (
      state,
      action: PayloadAction<{
        city: string;
        businessName: string;
        businessType: string;
      }>,
    ) => {
      state.city = action.payload.city;
      state.businessName = action.payload.businessName;
      state.businessType = action.payload.businessType;
    },
    setRegisterIdInfo: (
      state,
      action: PayloadAction<{
        cnic: string;
        cnicFront: CnicImage;
        cnicBack: CnicImage;
      }>,
    ) => {
      state.cnic = action.payload.cnic;
      state.cnicFront = action.payload.cnicFront;
      state.cnicBack = action.payload.cnicBack;
    },
    setRegisterRole: (state, action: PayloadAction<'buyer' | 'seller'>) => {
      state.role = action.payload;
    },
    resetRegisterForm: () => initialState,
  },
});

export const {
  setRegisterPhone,
  setRegisterBasicInfo,
  setRegisterBizInfo,
  setRegisterIdInfo,
  setRegisterRole,
  resetRegisterForm,
} = registerSlice.actions;

export default registerSlice.reducer;
