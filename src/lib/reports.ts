/**
 * End of day reports: build the table for each report, then print it,
 * save it as a PDF, or export it as CSV.
 */
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import type { EodReport, InventoryItem, Order } from '../data/types';
import { STATUS_NAMES } from '../data/types';
import { addDays, formatDue, formatLongDate, parseISODate } from './dates';

export interface ReportTable {
  title: string;
  subtitle: string;
  columns: string[];
  rows: string[][];
  empty: string;
}

export interface ReportContext {
  orders: Order[];
  inventory: InventoryItem[];
  /** YYYY-MM-DD the report is for */
  date: string;
}

const open = (o: Order) => o.status < 3;

function inArea(i: InventoryItem, area: EodReport['area']) {
  if (area === 'All production') return true;
  return i.prod === area || i.prod === 'Both';
}

function itemsText(o: Order, inv: Map<number, InventoryItem>) {
  const lines = o.lines.map((l) => `${l.qty} × ${inv.get(l.invId)?.name ?? 'Item'}`).join(', ');
  return [lines, o.notes].filter(Boolean).join('. ');
}

export function buildReport(r: EodReport, ctx: ReportContext): ReportTable {
  const inv = new Map(ctx.inventory.map((i) => [i.id, i]));
  const day = parseISODate(ctx.date);
  const subtitle = `${day ? formatLongDate(day) : ctx.date} · ${r.area}`;
  const week = addDays(ctx.date, 6);

  switch (r.type) {
    case 'Order Summary':
    case 'Preparation Sheet V2': {
      // Total of every inventory item needed by open orders, for this production area.
      const totals = new Map<number, number>();
      ctx.orders.filter(open).forEach((o) => o.lines.forEach((l) => totals.set(l.invId, (totals.get(l.invId) ?? 0) + l.qty)));
      const rows = [...totals.entries()]
        .map(([id, qty]) => ({ i: inv.get(id), qty }))
        .filter((x): x is { i: InventoryItem; qty: number } => !!x.i && inArea(x.i, r.area))
        .sort((a, b) => (r.type === 'Preparation Sheet V2' ? a.i.cat.localeCompare(b.i.cat) : 0) || a.i.name.localeCompare(b.i.name))
        .map(({ i, qty }) => [
          ...(r.type === 'Preparation Sheet V2' ? [i.cat] : []),
          i.name,
          i.unit,
          String(qty),
          String(i.onHand),
          i.onHand >= qty ? 'Enough' : `Short ${qty - i.onHand}`,
        ]);
      return {
        title: r.name,
        subtitle,
        columns: [...(r.type === 'Preparation Sheet V2' ? ['Team'] : []), 'Item', 'Unit', 'Total needed', 'On hand', 'Status'],
        rows,
        empty: 'No inventory items are on open orders for this production area.',
      };
    }
    case '7 Day Order Summary': {
      const rows = ctx.orders
        .filter((o) => open(o) && o.dueDate >= ctx.date && o.dueDate <= week)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .map((o) => [`#${o.id}`, o.customer, o.type, formatDue(o.dueDate, o.dueTime), STATUS_NAMES[o.status], itemsText(o, inv)]);
      return { title: r.name, subtitle: `${subtitle} · next 7 days`, columns: ['Order', 'Customer', 'Type', 'Due', 'Status', 'Items'], rows, empty: 'No open orders are due in the next 7 days.' };
    }
    case 'Picking List': {
      const rows: string[][] = [];
      ctx.orders
        .filter(open)
        .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
        .forEach((o) => {
          if (o.lines.length === 0) rows.push([`#${o.id}`, o.customer, formatDue(o.dueDate, o.dueTime), o.notes || '—', '']);
          o.lines.forEach((l, k) => {
            const i = inv.get(l.invId);
            rows.push(k === 0 ? [`#${o.id}`, o.customer, formatDue(o.dueDate, o.dueTime), `${i?.name ?? 'Item'} (${i?.unit ?? ''})`, String(l.qty)] : ['', '', '', `${i?.name ?? 'Item'} (${i?.unit ?? ''})`, String(l.qty)]);
          });
        });
      return { title: r.name, subtitle, columns: ['Order', 'Customer', 'Due', 'Item', 'Qty'], rows, empty: 'No open orders to pack.' };
    }
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function reportsToHtml(tables: ReportTable[]): string {
  const pages = tables
    .map(
      (t, i) => `
<section class="page"${i < tables.length - 1 ? ' style="page-break-after:always"' : ''}>
  <header>
    <div><div class="brand">Scratch Kitchen</div><h1>${esc(t.title)}</h1></div>
    <div class="sub">${esc(t.subtitle)}</div>
  </header>
  ${
    t.rows.length
      ? `<table><thead><tr>${t.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${t.rows
          .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table>`
      : `<p class="empty">${esc(t.empty)}</p>`
  }
</section>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(tables.map((t) => t.title).join(', '))}</title>
<style>
  @page { margin: 0.5in; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #2A2323; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #D4202A; padding-bottom: 8px; margin-bottom: 14px; }
  .brand { font-family: Georgia, serif; font-weight: 700; font-size: 20px; }
  h1 { font-size: 15px; margin: 2px 0 0; }
  .sub { font-size: 11px; color: #5F5551; text-align: right; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th { background: #F3E7E1; text-align: left; padding: 7px 8px; }
  td { padding: 6px 8px; border-top: 1px solid #E8DFD9; vertical-align: top; }
  tr:nth-child(even) td { background: #FAF6F3; }
  .empty { font-size: 12px; color: #5F5551; }
</style></head><body>${pages}</body></html>`;
}

export function reportToCsv(t: ReportTable): string {
  const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return [t.columns, ...t.rows].map((r) => r.map(cell).join(',')).join('\n');
}

export type Paper = 'Letter' | 'A4';
export type Layout = 'Portrait' | 'Landscape';

function pageSize(paper: Paper, layout: Layout) {
  const [w, h] = paper === 'Letter' ? [612, 792] : [595, 842];
  return layout === 'Portrait' ? { width: w, height: h } : { width: h, height: w };
}

const safeName = (s: string) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'report';

function printHtmlOnWeb(html: string) {
  const frame = document.createElement('iframe');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);
  const doc = frame.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}

/** Opens the phone's print screen (AirPrint on iPhone, the print service on Android). */
export async function printReports(tables: ReportTable[], paper: Paper, layout: Layout) {
  const html = reportsToHtml(tables);
  if (Platform.OS === 'web') return printHtmlOnWeb(html);
  await Print.printAsync({
    html,
    ...pageSize(paper, layout),
    orientation: layout === 'Portrait' ? Print.Orientation.portrait : Print.Orientation.landscape,
  });
}

/** Makes a PDF and opens the share sheet so it can be saved, emailed or sent to a printer app. */
export async function shareReportsPdf(tables: ReportTable[], paper: Paper, layout: Layout) {
  const html = reportsToHtml(tables);
  if (Platform.OS === 'web') return printHtmlOnWeb(html); // the browser's print screen offers Save as PDF
  const { uri } = await Print.printToFileAsync({ html, ...pageSize(paper, layout) });
  const name = tables.length === 1 ? safeName(tables[0].title) : 'end-of-day-reports';
  const target = new File(Paths.cache, `${name}.pdf`);
  try {
    if (target.exists) target.delete();
    await new File(uri).move(target);
  } catch {
    // Keep the original file name if it can't be renamed.
  }
  await Sharing.shareAsync(target.exists ? target.uri : uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Save or send the PDF' });
}

/** Saves the report as a CSV file and opens the share sheet. */
export async function shareReportCsv(t: ReportTable) {
  const csv = reportToCsv(t);
  const name = `${safeName(t.title)}.csv`;
  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  await file.write(csv);
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text', dialogTitle: 'Save or send the CSV' });
}
