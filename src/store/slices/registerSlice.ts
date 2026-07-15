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
  address: string;
  cnic: string;
  cnicFront: CnicImage | null;
  cnicBack: CnicImage | null;
  role: 'buyer' | 'seller';
  bankId: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
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
  address: '',
  cnic: '',
  cnicFront: null,
  cnicBack: null,
  role: 'buyer',
  bankId: '',
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    setRegisterPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setRegisterCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
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
        address: string;
      }>,
    ) => {
      state.city = action.payload.city;
      state.businessName = action.payload.businessName;
      state.businessType = action.payload.businessType;
      state.address = action.payload.address;
    },
    setRegisterIdInfo: (
      state,
      action: PayloadAction<{
        cnic: string;
        cnicFront: CnicImage | null;
        cnicBack: CnicImage | null;
      }>,
    ) => {
      state.cnic = action.payload.cnic;
      state.cnicFront = action.payload.cnicFront;
      state.cnicBack = action.payload.cnicBack;
    },
    setRegisterPayment: (
      state,
      action: PayloadAction<{
        bankId: string;
        bankName: string;
        accountTitle: string;
        accountNumber: string;
        iban: string;
      }>,
    ) => {
      state.bankId = action.payload.bankId;
      state.bankName = action.payload.bankName;
      state.accountTitle = action.payload.accountTitle;
      state.accountNumber = action.payload.accountNumber;
      state.iban = action.payload.iban;
    },
    setRegisterRole: (state, action: PayloadAction<'buyer' | 'seller'>) => {
      state.role = action.payload;
    },
    resetRegisterForm: () => initialState,
  },
});

export const {
  setRegisterPhone,
  setRegisterCity,
  setRegisterBasicInfo,
  setRegisterBizInfo,
  setRegisterIdInfo,
  setRegisterPayment,
  setRegisterRole,
  resetRegisterForm,
} = registerSlice.actions;

export default registerSlice.reducer;
