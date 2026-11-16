// Sample data, the same as the Staff Hub website uses today.
// Replace with real data once a shared database is connected (see store.tsx).
import type { Customer, EodReport, InventoryItem, Message, Need, Order } from './types';

export const sampleOrders: Order[] = [
  { id: 1001, customer: 'Sample customer A', type: 'Catering', dueDate: '2026-11-25', dueTime: '10:00 AM', lines: [], notes: 'Thanksgiving dinner for 12: turkey, three sides, two pies', status: 0, repeat: 'Does not repeat' },
  { id: 1002, customer: 'Sample customer B', type: 'Bakery', dueDate: '2026-11-24', dueTime: '8:00 AM', lines: [{ invId: 1, qty: 2 }, { invId: 2, qty: 4 }, { invId: 4, qty: 3 }], notes: 'Four dozen dinner rolls, two pumpkin pies', status: 1, repeat: 'Every week', seriesId: 1002 },
  { id: 1003, customer: 'Sample customer C', type: 'Catering', dueDate: '2026-11-25', dueTime: '2:00 PM', lines: [], notes: 'Office lunch for 25: sandwiches and salads', status: 0, repeat: 'Does not repeat' },
  { id: 1004, customer: 'Sample customer D', type: 'Bakery', dueDate: '2026-11-23', dueTime: '7:30 AM', lines: [], notes: 'One lemon sheet cake', status: 2, repeat: 'Does not repeat' },
];

export const sampleNeeds: Need[] = [
  { id: 1, item: 'Flour, 50 lb bags', qty: '4', dept: 'Baking', done: false },
  { id: 2, item: 'Butter, 1 lb blocks', qty: '40', dept: 'Baking', done: false },
  { id: 3, item: 'Disposable serving trays', qty: '30', dept: 'Catering', done: false },
  { id: 4, item: 'Chafing fuel', qty: '12', dept: 'Catering', done: true },
];

export const sampleInventory: InventoryItem[] = [
  { id: 1, name: 'Flour', cat: 'Baking', unit: '50 lb bag', onHand: 6, par: 4, cost: null, prod: 'Main Production' },
  { id: 2, name: 'Butter', cat: 'Baking', unit: '1 lb block', onHand: 30, par: 40, cost: null, prod: 'Main Production' },
  { id: 3, name: 'Sugar', cat: 'Baking', unit: '25 lb bag', onHand: 5, par: 3, cost: null, prod: 'Both' },
  { id: 4, name: 'Eggs', cat: 'Baking', unit: 'dozen', onHand: 20, par: 12, cost: null, prod: 'Second Shift Production' },
  { id: 5, name: 'Disposable serving trays', cat: 'Catering', unit: 'each', onHand: 18, par: 30, cost: null, prod: 'Second Shift Production' },
  { id: 6, name: 'Chafing fuel', cat: 'Catering', unit: 'can', onHand: 12, par: 12, cost: null, prod: 'Not assigned' },
  { id: 7, name: 'Foil pans', cat: 'Catering', unit: 'each', onHand: 40, par: 20, cost: null, prod: 'Both' },
];

export const sampleCustomers: Customer[] = [
  { id: 1, name: 'Sample customer A', type: 'Catering', email: '', phone: '', address: '', notes: '' },
  { id: 2, name: 'Sample customer B', type: 'Bakery', email: '', phone: '', address: '', notes: '' },
  { id: 3, name: 'Sample customer C', type: 'Catering', email: '', phone: '', address: '', notes: '' },
  { id: 4, name: 'Sample customer D', type: 'Bakery', email: '', phone: '', address: '', notes: '' },
];

export const sampleMessages: Message[] = [
  { id: 1, author: '[Team member]', time: '8:05 AM', text: 'Pie order for Wednesday was moved up to 8 AM. Please check the board.' },
  { id: 2, author: '[Team member]', time: '8:40 AM', text: 'We are low on butter. I added it to the items list.' },
];

export const sampleReports: EodReport[] = [
  { id: 1, seq: 1, type: 'Order Summary', area: 'All production', name: 'Production Totals - Grab & Go', lastRun: null, selected: false },
  { id: 5, seq: 2, type: 'Order Summary', area: 'Second Shift Production', name: 'Production Totals - 2nd Shift', lastRun: null, selected: false },
  { id: 7, seq: 3, type: 'Preparation Sheet V2', area: 'All production', name: 'Recipe Sheet', lastRun: null, selected: false },
  { id: 9, seq: 4, type: '7 Day Order Summary', area: 'All production', name: '7 Day Order Summary', lastRun: null, selected: false },
  { id: 10, seq: 5, type: 'Picking List', area: 'All production', name: 'Packing List', lastRun: null, selected: false },
  { id: 11, seq: 6, type: 'Picking List', area: 'All production', name: 'Packing List - Individual', lastRun: null, selected: false },
];
