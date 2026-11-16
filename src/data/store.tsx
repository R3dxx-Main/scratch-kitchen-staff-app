/**
 * The app's data, stored in the shared Supabase database.
 *
 * Every screen reads and changes data only through `useStore()`. Each table is loaded
 * once after sign-in and then kept up to date live: when someone changes an order on
 * one phone, every other phone gets the change within a second or two.
 * Changes show on this phone straight away and are saved in the background; if a save
 * fails, a message appears at the top of the screen.
 */
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatClock, formatStamp, nextRepeatDate, todayISO } from '../lib/dates';
import { supabase } from '../lib/supabase';
import { useAuth } from './auth';
import type { Customer, EodReport, InventoryItem, Message, Need, Order, OrderDraft, OrderStatus, ProductionArea, Team } from './types';

// ---------- Rows as stored in the database ----------
type OrderRow = { id: number; customer: string; type: Order['type']; due_date: string | null; due_time: string; lines: Order['lines'] | null; notes: string; status: number; repeat: Order['repeat']; series_id: number | null; edited: boolean };
type NeedRow = { id: number; item: string; qty: string; dept: Team; done: boolean; created_at: string };
type InventoryRow = { id: number; name: string; cat: Team; unit: string; on_hand: number; par: number; cost: number | string | null; prod: ProductionArea };
type CustomerRow = Customer;
type MessageRow = { id: number; author: string; text: string; created_at: string };
type ReportRow = { id: number; seq: number; type: EodReport['type']; area: EodReport['area']; name: string; last_run: string | null };

const fromOrder = (r: OrderRow): Order => ({
  id: r.id,
  customer: r.customer,
  type: r.type,
  dueDate: r.due_date ?? '',
  dueTime: r.due_time ?? '',
  lines: Array.isArray(r.lines) ? r.lines : [],
  notes: r.notes ?? '',
  status: r.status as OrderStatus,
  repeat: r.repeat,
  seriesId: r.series_id ?? undefined,
  edited: r.edited,
});
const fromNeed = (r: NeedRow): Need => ({ id: r.id, item: r.item, qty: r.qty, dept: r.dept, done: r.done });
const fromInventory = (r: InventoryRow): InventoryItem => ({
  id: r.id,
  name: r.name,
  cat: r.cat,
  unit: r.unit,
  onHand: r.on_hand,
  par: r.par,
  cost: r.cost == null ? null : Number(r.cost),
  prod: r.prod,
});
const fromCustomer = (r: CustomerRow): Customer => ({ id: r.id, name: r.name, type: r.type, email: r.email ?? '', phone: r.phone ?? '', address: r.address ?? '', notes: r.notes ?? '' });
const fromMessage = (r: MessageRow): Message => ({ id: r.id, author: r.author, text: r.text, time: formatClock(new Date(r.created_at)) });
type ReportBase = Omit<EodReport, 'selected'>;
const fromReport = (r: ReportRow): ReportBase => ({ id: r.id, seq: r.seq, type: r.type, area: r.area, name: r.name, lastRun: r.last_run ? formatStamp(new Date(r.last_run)) : null });

/**
 * Loads one table and keeps it live. Returns the rows and a setter for showing
 * changes on this phone before the database confirms them.
 */
function useLiveTable<R extends { id: number }, T extends { id: number }>(
  enabled: boolean,
  table: string,
  /** Must be a function defined outside components, so it never changes. */
  fromRow: (r: R) => T,
  order: { column: string; ascending: boolean },
  onError: (msg: string) => void,
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loaded, setLoaded] = useState(false);

  // The store is rebuilt from scratch whenever a different person signs in (see app/_layout.tsx),
  // so there is nothing to clear here when signed out.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase.from(table).select('*').order(order.column, { ascending: order.ascending }).order('id', { ascending: true });
      if (cancelled) return;
      if (error) onError(`Could not load ${table}: ${error.message}`);
      else setRows((data as R[]).map((r) => fromRow(r)));
      setLoaded(true);
    };

    const channel = supabase
      .channel(`live-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload: RealtimePostgresChangesPayload<R>) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<R>).id;
          setRows((list) => list.filter((x) => x.id !== id));
          return;
        }
        const item = fromRow(payload.new as R);
        setRows((list) => (list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item]));
      })
      .subscribe((status) => {
        // (Re)load whenever the live connection starts, so nothing missed while offline is lost.
        if (status === 'SUBSCRIBED') load();
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, table]);

  return [rows, setRows, loaded] as const;
}

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

const byDueDate = (a: Order, b: Order) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.id - b.id;

function useStoreValue() {
  const { session, displayName } = useAuth();
  const enabled = !!session;
  const [error, setError] = useState<string | null>(null);
  const report = useCallback((msg: string) => setError(msg), []);

  const [orders, setOrders, ordersLoaded] = useLiveTable<OrderRow, Order>(enabled, 'orders', fromOrder, { column: 'due_date', ascending: true }, report);
  const [needs, setNeeds, needsLoaded] = useLiveTable<NeedRow, Need>(enabled, 'needs', fromNeed, { column: 'created_at', ascending: false }, report);
  const [inventory, setInventory, invLoaded] = useLiveTable<InventoryRow, InventoryItem>(enabled, 'inventory', fromInventory, { column: 'name', ascending: true }, report);
  const [customers, setCustomers, custLoaded] = useLiveTable<CustomerRow, Customer>(enabled, 'customers', fromCustomer, { column: 'name', ascending: true }, report);
  const [messages, setMessages, msgLoaded] = useLiveTable<MessageRow, Message>(enabled, 'messages', fromMessage, { column: 'created_at', ascending: true }, report);
  const [reportRows, setReportRows, repLoaded] = useLiveTable<ReportRow, ReportBase>(enabled, 'reports', fromReport, { column: 'seq', ascending: true }, report);
  const [selectedReports, setSelectedReports] = useState<Set<number>>(new Set());
  const [draft, setDraftState] = useState<OrderDraft>(blankDraft);

  const loading = enabled && !(ordersLoaded && needsLoaded && invLoaded && custLoaded && msgLoaded && repLoaded);
  const reports: EodReport[] = useMemo(
    () => reportRows.slice().sort((a, b) => a.seq - b.seq).map((r) => ({ ...r, selected: selectedReports.has(r.id) })),
    [reportRows, selectedReports],
  );

  /** Runs a database change and shows a message if it fails. */
  const save = useCallback(
    async <X,>(what: string, op: PromiseLike<{ error: { message: string; code?: string } | null; data?: X }>) => {
      const { error: e, data } = await op;
      if (e) {
        report(`${what} was not saved: ${e.message}`);
        return { ok: false as const, code: e.code };
      }
      return { ok: true as const, data };
    },
    [report],
  );

  // ---------- Orders ----------
  const addNextInSeries = useCallback(
    async (o: Order, list: Order[]) => {
      if (o.repeat === 'Does not repeat' || !o.seriesId || !o.dueDate) return;
      const date = nextRepeatDate(o.dueDate, o.repeat);
      if (list.some((x) => x.seriesId === o.seriesId && x.dueDate === date)) return;
      const { error: e } = await supabase.from('orders').insert({
        customer: o.customer, type: o.type, due_date: date, due_time: o.dueTime, lines: o.lines, notes: o.notes, status: 0, repeat: o.repeat, series_id: o.seriesId, edited: false,
      });
      // 23505: another phone already added this day of the series.
      if (e && e.code !== '23505') report(`The next repeat of order #${o.id} was not added: ${e.message}`);
    },
    [report],
  );

  const setStatus = useCallback(
    (id: number, status: OrderStatus) => {
      setOrders((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));
      return save('The order', supabase.from('orders').update({ status }).eq('id', id));
    },
    [save, setOrders],
  );

  const advanceOrder = useCallback(
    async (id: number) => {
      const o = orders.find((x) => x.id === id);
      if (!o || o.status >= 3) return;
      const next = (o.status + 1) as OrderStatus;
      const r = await setStatus(id, next);
      if (r.ok && next === 3) await addNextInSeries(o, orders);
    },
    [orders, setStatus, addNextInSeries],
  );

  const skipDay = useCallback(
    async (id: number) => {
      const o = orders.find((x) => x.id === id);
      if (!o) return;
      const r = await setStatus(id, 4);
      if (r.ok) await addNextInSeries(o, orders);
    },
    [orders, setStatus, addNextInSeries],
  );

  const restoreDay = useCallback((id: number) => void setStatus(id, 0), [setStatus]);

  const stopRepeating = useCallback(
    async (id: number) => {
      const o = orders.find((x) => x.id === id);
      if (!o) return;
      const later = o.seriesId ? orders.filter((x) => x.seriesId === o.seriesId && x.id !== o.id && !!o.dueDate && x.dueDate > o.dueDate && (x.status < 3 || x.status === 4)).map((x) => x.id) : [];
      setOrders((l) => l.filter((x) => !later.includes(x.id)).map((x) => (o.seriesId ? x.seriesId === o.seriesId : x.id === o.id) ? { ...x, repeat: 'Does not repeat' } : x));
      if (later.length) await save('Stopping the repeats', supabase.from('orders').delete().in('id', later));
      await save('Stopping the repeats', o.seriesId ? supabase.from('orders').update({ repeat: 'Does not repeat' }).eq('series_id', o.seriesId) : supabase.from('orders').update({ repeat: 'Does not repeat' }).eq('id', o.id));
    },
    [orders, save, setOrders],
  );

  const deleteOrder = useCallback(
    (id: number) => {
      setOrders((l) => l.filter((o) => o.id !== id));
      void save('Deleting the order', supabase.from('orders').delete().eq('id', id));
    },
    [save, setOrders],
  );

  const startDraft = useCallback(
    (id: number | null) => {
      if (id == null) return setDraftState(blankDraft());
      const o = orders.find((x) => x.id === id);
      if (!o) return;
      const qty: Record<number, number> = {};
      o.lines.forEach((l) => (qty[l.invId] = l.qty));
      setDraftState({ editingId: o.id, customer: o.customer, type: o.type, dueDate: o.dueDate, dueTime: o.dueTime, qty, notes: o.notes, repeat: o.repeat, scope: 'one' });
    },
    [orders],
  );

  const setDraft = useCallback((patch: Partial<OrderDraft>) => setDraftState((d) => ({ ...d, ...patch })), []);

  /** Saves the draft. Returns a message to show if something is missing or failed, or null when saved. */
  const saveDraft = useCallback(async (): Promise<string | null> => {
    const d = draft;
    const customer = d.customer.trim();
    if (!customer) return 'Choose a customer or type a new one.';
    if (d.repeat !== 'Does not repeat' && !d.dueDate) return 'Pick a due date so the repeat dates can be set.';
    const lines = Object.entries(d.qty)
      .filter(([, q]) => q > 0)
      .map(([invId, q]) => ({ invId: Number(invId), qty: q }));
    const fields = { customer, type: d.type, due_date: d.dueDate || null, due_time: d.dueTime.trim(), lines, notes: d.notes.trim(), repeat: d.repeat };

    if (d.editingId == null) {
      const { data, error: e } = await supabase.from('orders').insert({ ...fields, status: 0 }).select().single();
      if (e || !data) return `The order was not saved: ${e?.message ?? 'no reply from the database'}`;
      const row = data as OrderRow;
      setOrders((l) => (l.some((x) => x.id === row.id) ? l : [...l, fromOrder(row)]));
      if (d.repeat !== 'Does not repeat') await save('The repeat', supabase.from('orders').update({ series_id: row.id }).eq('id', row.id));
    } else {
      const o = orders.find((x) => x.id === d.editingId);
      if (!o) return 'This order was deleted on another device.';
      const seriesId = o.seriesId ?? (d.repeat !== 'Does not repeat' ? o.id : null);
      const r = await save('The order', supabase.from('orders').update({ ...fields, series_id: seriesId, edited: true }).eq('id', o.id));
      if (!r.ok) return 'The changes were not saved. Check the connection and try again.';
      if (d.scope === 'later' && o.seriesId && o.dueDate) {
        const { due_date: _keep, ...rest } = fields;
        await save('The later repeats', supabase.from('orders').update({ ...rest, edited: true }).eq('series_id', o.seriesId).gt('due_date', o.dueDate).lt('status', 3));
      }
      await save(
        'The team message',
        supabase.from('messages').insert({ author: displayName, text: `Order #${o.id}${d.scope === 'later' ? ' and its later repeats were' : ' was'} changed. Please check the order board.` }),
      );
    }

    // A newly typed customer is added to the customer list.
    if (!customers.some((c) => c.name.toLowerCase() === customer.toLowerCase())) {
      await save('The new customer', supabase.from('customers').insert({ name: customer, type: d.type }));
    }
    setDraftState(blankDraft());
    return null;
  }, [draft, orders, customers, displayName, save, setOrders]);

  // ---------- Items needed ----------
  const toggleNeed = useCallback(
    (id: number) => {
      const n = needs.find((x) => x.id === id);
      if (!n) return;
      setNeeds((l) => l.map((x) => (x.id === id ? { ...x, done: !n.done } : x)));
      void save('The item', supabase.from('needs').update({ done: !n.done }).eq('id', id));
    },
    [needs, save, setNeeds],
  );
  const clearDoneNeeds = useCallback(() => {
    setNeeds((l) => l.filter((n) => !n.done));
    void save('Clearing done items', supabase.from('needs').delete().eq('done', true));
  }, [save, setNeeds]);
  const addNeed = useCallback(
    async (n: { item: string; qty: string; dept: Team }) => {
      const { data, error: e } = await supabase.from('needs').insert({ ...n, done: false }).select().single();
      if (e || !data) return report(`The item was not added: ${e?.message ?? ''}`);
      const row = fromNeed(data as NeedRow);
      setNeeds((l) => (l.some((x) => x.id === row.id) ? l : [row, ...l]));
    },
    [report, setNeeds],
  );

  // ---------- Inventory ----------
  const changeOnHand = useCallback(
    (id: number, delta: number) => {
      setInventory((l) => l.map((i) => (i.id === id ? { ...i, onHand: Math.max(0, i.onHand + delta) } : i)));
      void save('The count', supabase.rpc('adjust_on_hand', { p_id: id, p_delta: delta }));
    },
    [save, setInventory],
  );
  const setCost = useCallback(
    (id: number, cost: number | null) => {
      setInventory((l) => l.map((i) => (i.id === id ? { ...i, cost } : i)));
      void save('The cost', supabase.from('inventory').update({ cost }).eq('id', id));
    },
    [save, setInventory],
  );
  const setProduction = useCallback(
    (id: number, prod: ProductionArea) => {
      setInventory((l) => l.map((i) => (i.id === id ? { ...i, prod } : i)));
      void save('Send to production', supabase.from('inventory').update({ prod }).eq('id', id));
    },
    [save, setInventory],
  );
  const addInventory = useCallback(
    async (item: Omit<InventoryItem, 'id'>) => {
      const { data, error: e } = await supabase
        .from('inventory')
        .insert({ name: item.name, cat: item.cat, unit: item.unit, on_hand: item.onHand, par: item.par, cost: item.cost, prod: item.prod })
        .select()
        .single();
      if (e || !data) return report(`The inventory item was not added: ${e?.message ?? ''}`);
      const row = fromInventory(data as InventoryRow);
      setInventory((l) => (l.some((x) => x.id === row.id) ? l : [...l, row]));
    },
    [report, setInventory],
  );
  const removeInventory = useCallback(
    (id: number) => {
      setInventory((l) => l.filter((i) => i.id !== id));
      void save('Removing the item', supabase.from('inventory').delete().eq('id', id));
    },
    [save, setInventory],
  );
  const requestInventoryItem = useCallback(
    (id: number) => {
      const i = inventory.find((x) => x.id === id);
      if (!i) return;
      void addNeed({ item: `${i.name} (${i.unit})`, qty: String(Math.max(1, i.par * 2 - i.onHand)), dept: i.cat });
    },
    [inventory, addNeed],
  );

  // ---------- Customers ----------
  const saveCustomer = useCallback(
    async (c: Omit<Customer, 'id'> & { id?: number }) => {
      const fields = { name: c.name, type: c.type, email: c.email, phone: c.phone, address: c.address, notes: c.notes };
      if (c.id != null) {
        setCustomers((l) => l.map((x) => (x.id === c.id ? { ...x, ...fields } : x)));
        await save('The customer', supabase.from('customers').update(fields).eq('id', c.id));
        return;
      }
      const { data, error: e } = await supabase.from('customers').insert(fields).select().single();
      if (e || !data) return report(`The customer was not added: ${e?.message ?? ''}`);
      const row = fromCustomer(data as CustomerRow);
      setCustomers((l) => (l.some((x) => x.id === row.id) ? l : [...l, row]));
    },
    [report, save, setCustomers],
  );
  const deleteCustomer = useCallback(
    (id: number) => {
      setCustomers((l) => l.filter((c) => c.id !== id));
      void save('Deleting the customer', supabase.from('customers').delete().eq('id', id));
    },
    [save, setCustomers],
  );

  // ---------- Team messages ----------
  const sendMessage = useCallback(
    async (text: string) => {
      const t = text.trim();
      if (!t) return;
      const { data, error: e } = await supabase.from('messages').insert({ author: displayName, text: t }).select().single();
      if (e || !data) return report(`The message was not sent: ${e?.message ?? ''}`);
      const row = fromMessage(data as MessageRow);
      setMessages((l) => (l.some((x) => x.id === row.id) ? l : [...l, row]));
    },
    [displayName, report, setMessages],
  );

  // ---------- End of day reports ----------
  const toggleReport = useCallback((id: number) => setSelectedReports((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  }), []);
  const selectAllReports = useCallback((on: boolean) => setSelectedReports(on ? new Set(reportRows.map((r) => r.id)) : new Set()), [reportRows]);
  const generateReports = useCallback(
    (ids: number[]) => {
      if (!ids.length) return;
      const now = new Date();
      setReportRows((l) => l.map((r) => (ids.includes(r.id) ? { ...r, lastRun: formatStamp(now) } : r)));
      void save('Generating the reports', supabase.from('reports').update({ last_run: now.toISOString() }).in('id', ids));
    },
    [save, setReportRows],
  );
  const saveReport = useCallback(
    async (r: Omit<EodReport, 'id' | 'seq' | 'lastRun' | 'selected'> & { id?: number }) => {
      const fields = { name: r.name, type: r.type, area: r.area };
      if (r.id != null) {
        setReportRows((l) => l.map((x) => (x.id === r.id ? { ...x, ...fields } : x)));
        await save('The report', supabase.from('reports').update(fields).eq('id', r.id));
        return;
      }
      const seq = reportRows.reduce((m, x) => Math.max(m, x.seq), 0) + 1;
      const { data, error: e } = await supabase.from('reports').insert({ ...fields, seq }).select().single();
      if (e || !data) return report(`The report was not added: ${e?.message ?? ''}`);
      const row = fromReport(data as ReportRow);
      setReportRows((l) => (l.some((x) => x.id === row.id) ? l : [...l, row]));
    },
    [reportRows, report, save, setReportRows],
  );
  const removeReport = useCallback(
    async (id: number) => {
      const rest = reportRows.filter((r) => r.id !== id).sort((a, b) => a.seq - b.seq).map((r, i) => ({ ...r, seq: i + 1 }));
      setReportRows(rest);
      await save('Deleting the report', supabase.from('reports').delete().eq('id', id));
      for (const r of rest) {
        const before = reportRows.find((x) => x.id === r.id);
        if (before && before.seq !== r.seq) await save('Renumbering the reports', supabase.from('reports').update({ seq: r.seq }).eq('id', r.id));
      }
    },
    [reportRows, save, setReportRows],
  );

  return {
    today: todayISO(),
    userName: displayName,
    loading,
    error,
    clearError: () => setError(null),
    orders: useMemo(() => orders.slice().sort(byDueDate), [orders]),
    needs, inventory, customers, messages, reports, draft,
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
