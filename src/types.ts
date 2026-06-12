export interface DonationAccount {
  id: string;
  title: string;       // e.g. "OFFERING ACCOUNT DETAILS"
  bankName: string;    // e.g. "UBA"
  accountNumber: string; // e.g. "1028246694"
  accountName: string;   // e.g. "RCCG HOUSE OF GLORY"
  isDefault?: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  copiedValue: string;
  type: 'success' | 'info';
}
