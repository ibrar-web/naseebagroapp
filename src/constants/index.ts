export * from './theme';

export const APP_NAME = 'Naseeb Agri Market';
export const APP_VERSION = '1.0.0';

export const CATEGORIES = ['All', 'Grains', 'Cotton', 'Vegetables', 'Oilseeds', 'Fruits', 'Spices'];

export const DEAL_STAGES = [
  'Demand Placed', 'Admin Review', 'Offer Sent', 'Negotiation',
  'Deal Agreed', 'Payment Initiated', 'Payment Confirmed',
  'Goods Ready', 'In Transit', 'Delivered', 'Inspection',
  'Payment Released', 'Completed',
];

export const CITIES = [
  'Lahore', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot',
  'Rawalpindi', 'Islamabad', 'Peshawar', 'Quetta', 'Karachi',
  'Hyderabad', 'Sukkur', 'Larkana', 'Bahawalpur', 'Sargodha',
];

export const BANKS = [
  'HBL', 'MCB', 'UBL', 'Allied Bank', 'Bank Alfalah',
  'Meezan Bank', 'Faysal Bank', 'Standard Chartered', 'NBP',
];

export const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: '#FEF3C7', color: '#D97706' },
  Approved:  { bg: '#D1FAE5', color: '#065F46' },
  Rejected:  { bg: '#FEE2E2', color: '#B91C1C' },
  Active:    { bg: '#DBEAFE', color: '#1D4ED8' },
  Completed: { bg: '#F3F4F6', color: '#6B7280' },
  Transit:   { bg: '#EDE9FE', color: '#6D28D9' },
};
