export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  assignedTo: string[]; // names of participants
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  avatarBg: string;
}

export interface ItemShare {
  itemId: string;
  itemName: string;
  itemPrice: number;
  shareFraction: number; // e.g. 0.5 if shared between 2 people
  shareAmount: number; // e.g. $9.00
  totalCoSharedWith: string[];
}

export interface PersonShare {
  participantName: string;
  items: ItemShare[];
  subtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
  percentOfAssigned: number;
  percentOfBill: number;
}

export interface SplitSummary {
  participantsShares: PersonShare[];
  assignedSubtotal: number;
  unassignedSubtotal: number;
  totalSubtotal: number;
  assignedItemsCount: number;
  totalItemsCount: number;
  totalTax: number;
  totalTip: number;
  grandTotal: number;
  unassignedItems: ReceiptItem[];
  unassignedTax: number;
  unassignedTip: number;
  unassignedTotal: number;
}

export interface ReceiptData {
  restaurantName: string;
  date: string;
  currency: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  tipPercentage?: number;
  total: number;
  imageUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionBadges?: string[];
  suggestedPrompts?: string[];
}
