export type OrderType = 'Catering' | 'Bakery';
export type Team = 'Baking' | 'Catering';
export type ProductionArea = 'Not assigned' | 'Main Production' | 'Second Shift Production' | 'Both';
export type Repeat = 'Does not repeat' | 'Every day' | 'Every week' | 'Every 2 weeks' | 'Every month';

/** 0 New, 1 In prep, 2 Ready, 3 Picked up, 4 Skipped */
export type OrderStatus = 0 | 1 | 2 | 3 | 4;

export const STATUS_NAMES = ['New', 'In prep', 'Ready', 'Picked up', 'Skipped'] as const;
export const ACTION_NAMES = ['Start prep', 'Mark ready', 'Mark picked up', 'Completed', 'Skipped'] as const;
export const REPEAT_OPTIONS: Repeat[] = ['Does not repeat', 'Every day', 'Every week', 'Every 2 weeks', 'Every month'];
export const PRODUCTION_AREAS: ProductionArea[] = ['Main Production', 'Second Shift Production', 'Both', 'Not assigned'];

export interface OrderLine {
  invId: number;
  qty: number;
}

export interface Order {
  id: number;
  customer: string;
  type: OrderType;
  /** YYYY-MM-DD */
  dueDate: string;
  /** Free text, e.g. "10:00 AM" */
  dueTime: string;
  lines: OrderLine[];
  notes: string;
  status: OrderStatus;
  repeat: Repeat;
  /** Orders created from the same repeating order share a series id. */
  seriesId?: number;
  edited?: boolean;
}

export interface Need {
  id: number;
  item: string;
  qty: string;
  dept: Team;
  done: boolean;
}

export interface InventoryItem {
  id: number;
  name: string;
  cat: Team;
  unit: string;
  onHand: number;
  par: number;
  /** Cost per unit in dollars, or null when not set yet. */
  cost: number | null;
  prod: ProductionArea;
}

export interface Customer {
  id: number;
  name: string;
  type: OrderType;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Message {
  id: number;
  author: string;
  time: string;
  text: string;
}

export interface EodReport {
  id: number;
  seq: number;
  type: 'Order Summary' | 'Preparation Sheet V2' | '7 Day Order Summary' | 'Picking List';
  area: 'All production' | 'Main Production' | 'Second Shift Production';
  name: string;
  /** When it was last generated, or null if never. */
  lastRun: string | null;
  selected: boolean;
}

/** The order being added or edited, shared by the order form and the customer picker. */
export interface OrderDraft {
  editingId: number | null;
  customer: string;
  type: OrderType;
  dueDate: string;
  dueTime: string;
  qty: Record<number, number>;
  notes: string;
  repeat: Repeat;
  scope: 'one' | 'later';
}
