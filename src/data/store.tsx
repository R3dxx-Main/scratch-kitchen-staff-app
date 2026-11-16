/**
 * The app's data, kept in memory and started from sample data.
 *
 * Every screen reads and changes data only through `useStore()`, so connecting a
 * real shared database later (Supabase, Firebase or the Staff Hub's own backend)
 * means changing this file, not the screens.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { formatClock, formatStamp, nextRepeatDate, todayISO } from '../lib/dates';
import { sampleCustomers, sampleInventory, sampleMessages, sampleNeeds, sampleOrders, sampleReports } from './sampleData';
import type { Customer, EodReport, InventoryItem, Message, Need, Order, OrderDraft, OrderStatus, ProductionArea, Team } from './types';

const blankDraft = (): OrderDraft => ({
  editingId: null,
  customer: '',
  type: 'Catering',
  dueDate: '',
  dueTime: '',
  qty: {},
  notes: '',
  repeat: 'Does not repeat',
  scope: 'one',
});

function useStoreValue() {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [needs, setNeeds] = useState<Need[]>(sampleNeeds);
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [reports, setReports] = useState<EodReport[]>(sampleReports);
  const [draft, setDraftState] = useState<OrderDraft>(blankDraft);
  const [userName] = useState('[Your name]');

  const nextId = (list: { id: number }[]) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;

  // ---------- Orders ----------
  const setStatus = useCallback((id: number, status: OrderStatus) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  /** When a repeating order is finished or skipped, the next one in the series is added. */
  const withNextInSeries = (list: Order[], order: Order): Order[] => {
    if (order.repeat === 'Does not repeat' || !order.seriesId) return list;
    const date = nextRepeatDate(order.dueDate, order.repeat);
    if (list.some((o) => o.seriesId === order.seriesId && o.dueDate === date)) return list;
    const id = nextId(list);
    return [...list, { ...order, id, dueDate: date, status: 0, edited: false, lines: order.lines.map((l) => ({ ...l })) }];
  };

  const advanceOrder = useCallback((id: number) => {
    setOrders((list) => {
      const o = list.find((x) => x.id === id);
      if (!o || o.status >= 3) return list;
      const next = (o.status + 1) as OrderStatus;
      const updated = list.map((x) => (x.id === id ? { ...x, status: next } : x));
      return next === 3 ? withNextInSeries(updated, o) : updated;
    });
  }, []);

  const skipDay = useCallback((id: number) => {
    setOrders((list) => {
      const o = list.find((x) => x.id === id);
      if (!o) return list;
      return withNextInSeries(list.map((x) => (x.id === id ? { ...x, status: 4 as OrderStatus } : x)), o);
    });
  }, []);

  const restoreDay = useCallback((id: number) => setStatus(id, 0), [setStatus]);

  const stopRepeating = useCallback((id: number) => {
    setOrders((list) => {
      const o = list.find((x) => x.id === id);
      if (!o) return list;
      return list
        .filter((x) => !(o.seriesId && x.seriesId === o.seriesId && x.id !== o.id && x.dueDate > o.dueDate && (x.status < 3 || x.status === 4)))
        .map((x) => (o.seriesId && x.seriesId === o.seriesId ? { ...x, repeat: 'Does not repeat' } : x));
    });
  }, []);

  const deleteOrder = useCallback((id: number) => setOrders((list) => list.filter((o) => o.id !== id)), []);

  /** Start the order form: blank for a new order, or filled from an existing one. */
  const startDraft = useCallback(
    (id: number | null) => {
      if (id == null) {
        setDraftState(blankDraft());
        return;
      }
      const o = orders.find((x) => x.id === id);
      if (!o) return;
      const qty: Record<number, number> = {};
      o.lines.forEach((l) => (qty[l.invId] = l.qty));
      setDraftState({ editingId: o.id, customer: o.customer, type: o.type, dueDate: o.dueDate, dueTime: o.dueTime, qty, notes: o.notes, repeat: o.repeat, scope: 'one' });
    },
    [orders],
  );

  const setDraft = useCallback((patch: Partial<OrderDraft>) => setDraftState((d) => ({ ...d, ...patch })), []);

  /** Save the draft. Returns a message to show if something is missing, or null when saved. */
  const saveDraft = useCallback((): string | null => {
    const d = draft;
    const customer = d.customer.trim();
    if (!customer) return 'Choose a customer or type a new one.';
    if (d.repeat !== 'Does not repeat' && !d.dueDate) return 'Pick a due date so the repeat dates can be set.';
    const lines = Object.entries(d.qty)
      .filter(([, q]) => q > 0)
      .map(([invId, q]) => ({ invId: Number(invId), qty: q }));
    const fields = { customer, type: d.type, dueDate: d.dueDate, dueTime: d.dueTime.trim(), lines, notes: d.notes.trim(), repeat: d.repeat };

    setOrders((list) => {
      if (d.editingId == null) {
        const id = nextId(list);
        return [...list, { id, ...fields, status: 0, seriesId: d.repeat !== 'Does not repeat' ? id : undefined }];
      }
      const o = list.find((x) => x.id === d.editingId);
      if (!o) return list;
      const seriesId = o.seriesId ?? (d.repeat !== 'Does not repeat' ? o.id : undefined);
      return list.map((x) => {
        if (x.id === o.id) return { ...x, ...fields, seriesId, edited: true };
        if (d.scope === 'later' && o.seriesId && x.seriesId === o.seriesId && x.dueDate > o.dueDate && x.status < 3) {
          const { dueDate: _keep, ...rest } = fields;
          return { ...x, ...rest, lines: lines.map((l) => ({ ...l })), edited: true };
        }
        return x;
      });
    });

    // A newly typed customer is added to the customer list.
    if (!customers.some((c) => c.name.toLowerCase() === customer.toLowerCase())) {
      setCustomers((list) => [...list, { id: nextId(list), name: customer, type: d.type, email: '', phone: '', address: '', notes: '' }]);
    }
    if (d.editingId != null) {
      setMessages((list) => [
        ...list,
        { id: nextId(list), author: userName, time: formatClock(new Date()), text: `Order #${d.editingId}${d.scope === 'later' ? ' and its later repeats were' : ' was'} changed. Please check the order board.` },
      ]);
    }
    setDraftState(blankDraft());
    return null;
  }, [draft, customers, userName]);

  // ---------- Items needed ----------
  const toggleNeed = useCallback((id: number) => setNeeds((l) => l.map((n) => (n.id === id ? { ...n, done: !n.done } : n))), []);
  const clearDoneNeeds = useCallback(() => setNeeds((l) => l.filter((n) => !n.done)), []);
  const addNeed = useCallback((n: { item: string; qty: string; dept: Team }) => {
    setNeeds((l) => [{ id: nextId(l), ...n, done: false }, ...l]);
  }, []);

  // ---------- Inventory ----------
  const changeOnHand = useCallback((id: number, delta: number) => {
    setInventory((l) => l.map((i) => (i.id === id ? { ...i, onHand: Math.max(0, i.onHand + delta) } : i)));
  }, []);
  const setCost = useCallback((id: number, cost: number | null) => setInventory((l) => l.map((i) => (i.id === id ? { ...i, cost } : i))), []);
  const setProduction = useCallback((id: number, prod: ProductionArea) => setInventory((l) => l.map((i) => (i.id === id ? { ...i, prod } : i))), []);
  const addInventory = useCallback((item: Omit<InventoryItem, 'id'>) => setInventory((l) => [...l, { id: nextId(l), ...item }]), []);
  const removeInventory = useCallback((id: number) => setInventory((l) => l.filter((i) => i.id !== id)), []);
  const requestInventoryItem = useCallback(
    (id: number) => {
      const i = inventory.find((x) => x.id === id);
      if (!i) return;
      addNeed({ item: `${i.name} (${i.unit})`, qty: String(Math.max(1, i.par * 2 - i.onHand)), dept: i.cat });
    },
    [inventory, addNeed],
  );

  // ---------- Customers ----------
  const saveCustomer = useCallback((c: Omit<Customer, 'id'> & { id?: number }) => {
    setCustomers((l) => (c.id != null ? l.map((x) => (x.id === c.id ? { ...x, ...c, id: x.id } : x)) : [...l, { ...c, id: nextId(l) }]));
  }, []);
  const deleteCustomer = useCallback((id: number) => setCustomers((l) => l.filter((c) => c.id !== id)), []);

  // ---------- Team messages ----------
  const sendMessage = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      setMessages((l) => [...l, { id: nextId(l), author: userName, time: formatClock(new Date()), text: t }]);
    },
    [userName],
  );

  // ---------- End of day reports ----------
  const toggleReport = useCallback((id: number) => setReports((l) => l.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))), []);
  const selectAllReports = useCallback((on: boolean) => setReports((l) => l.map((r) => ({ ...r, selected: on }))), []);
  const generateReports = useCallback((ids: number[]) => {
    const stamp = formatStamp(new Date());
    setReports((l) => l.map((r) => (ids.includes(r.id) ? { ...r, lastRun: stamp } : r)));
  }, []);
  const saveReport = useCallback((r: Omit<EodReport, 'id' | 'seq' | 'lastRun' | 'selected'> & { id?: number }) => {
    setReports((l) =>
      r.id != null
        ? l.map((x) => (x.id === r.id ? { ...x, ...r, id: x.id } : x))
        : [...l, { ...r, id: nextId(l), seq: l.length + 1, lastRun: null, selected: false }],
    );
  }, []);
  const removeReport = useCallback((id: number) => setReports((l) => l.filter((r) => r.id !== id).map((r, i) => ({ ...r, seq: i + 1 }))), []);

  return {
    today: todayISO(),
    userName,
    orders, needs, inventory, customers, messages, reports, draft,
    advanceOrder, skipDay, restoreDay, stopRepeating, deleteOrder, startDraft, setDraft, saveDraft,
    toggleNeed, clearDoneNeeds, addNeed,
    changeOnHand, setCost, setProduction, addInventory, removeInventory, requestInventoryItem,
    saveCustomer, deleteCustomer,
    sendMessage,
    toggleReport, selectAllReports, generateReports, saveReport, removeReport,
  };
}

export type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

/** "2 × Flour, 4 × Butter. Four dozen dinner rolls…" like the website's order card. */
export function useOrderItemsLabel() {
  const { inventory } = useStore();
  return useMemo(() => {
    const byId = new Map(inventory.map((i) => [i.id, i]));
    return (o: Order) => {
      const lines = o.lines.map((l) => `${l.qty} × ${byId.get(l.invId)?.name ?? 'Item'}`).join(', ');
      return [lines, o.notes].filter(Boolean).join('. ');
    };
  }, [inventory]);
}

export const isOpen = (o: Order) => o.status < 3;
export const isLow = (i: InventoryItem) => i.onHand <= i.par;
