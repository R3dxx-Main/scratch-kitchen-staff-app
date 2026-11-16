// Outputs / End of day: run, print and download reports.
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell, useIsWide } from '../../components/AppShell';
import { DownloadIcon, PrintIcon } from '../../components/icons';
import { confirm } from '../../components/OrderForm';
import { Button, Card, CheckBox, Crumb, Field, H1, H2, Intro, Label, Muted, Notice, Segmented } from '../../components/ui';
import { useStore } from '../../data/store';
import { EodReport } from '../../data/types';
import { buildReport, shareReportCsv, shareReportsPdf } from '../../lib/reports';
import { colors, fonts } from '../../theme';

export default function EndOfDay() {
  const { reports, orders, inventory, today, toggleReport, selectAllReports, generateReports } = useStore();
  const wide = useIsWide();
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<EodReport | 'new' | null>(null);
  const query = q.trim().toLowerCase();
  const shown = reports.filter((r) => !query || r.name.toLowerCase().includes(query) || r.type.toLowerCase().includes(query));
  const selected = reports.filter((r) => r.selected);
  const allSelected = reports.length > 0 && selected.length === reports.length;
  const ctx = { orders, inventory, date: today };

  const run = async (label: string, fn: () => Promise<void>) => {
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(`${label} did not finish. ${e instanceof Error ? e.message : ''}`.trim());
    }
  };

  const footer = (
    <>
      <Button
        label={selected.length ? `Print selected (${selected.length})` : 'Select reports to print'}
        icon={<PrintIcon color={selected.length ? colors.white : colors.disabledText} bg={selected.length ? colors.red : colors.disabledBg} />}
        disabled={!selected.length}
        onPress={() => {
          generateReports(selected.map((r) => r.id));
          router.push('/outputs/print');
        }}
        big
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          label="Generate selected"
          variant="outline"
          disabled={!selected.length}
          onPress={() => {
            generateReports(selected.map((r) => r.id));
            setMsg(`${selected.length} report${selected.length === 1 ? '' : 's'} generated.`);
          }}
          style={{ flex: 1, minHeight: 48, paddingHorizontal: 8 }}
        />
        <Button
          label="Download PDFs"
          accessibilityLabel="Download selected PDFs"
          variant="outline"
          disabled={!selected.length}
          onPress={() =>
            run('The PDF', async () => {
              generateReports(selected.map((r) => r.id));
              await shareReportsPdf(selected.map((r) => buildReport(r, ctx)), 'Letter', 'Portrait');
            })
          }
          style={{ flex: 1, minHeight: 48, paddingHorizontal: 8 }}
        />
      </View>
    </>
  );

  return (
    <AppShell section="Outputs" sub="End of day" footer={footer}>
      <Crumb>Outputs</Crumb>
      <H1>End of day</H1>
      <Intro>Reports to run and print when the day wraps up.</Intro>

      {form ? (
        <ReportForm report={form === 'new' ? null : form} onClose={() => setForm(null)} />
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Search reports" hideLabel placeholder="Search reports" value={q} onChangeText={setQ} />
          </View>
          <Button label="+ Add report" variant="outline" onPress={() => setForm('new')} style={{ borderRadius: 8, paddingHorizontal: 16 }} />
        </View>
      )}

      {msg && <Notice text={msg} tone={msg.includes('did not') ? 'warn' : 'ok'} />}

      <View style={st.selAll}>
        <CheckBox checked={allSelected} onPress={() => selectAllReports(!allSelected)} label="Select all reports" size={26} />
        <Text style={st.selAllText}>Select all reports</Text>
      </View>

      <View style={[{ gap: 12 }, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {shown.map((r) => (
          <Card key={r.id} style={[{ padding: 14 }, wide && { width: '48.5%' }]}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <CheckBox checked={r.selected} onPress={() => toggleReport(r.id)} label={`Select ${r.name}`} size={26} />
              <View style={{ flex: 1 }}>
                <Muted>
                  {r.seq} · {r.type}
                </Muted>
                <Text style={st.name}>{r.name}</Text>
                <Muted>
                  {r.area} · Last run: {r.lastRun ?? 'Not run yet'}
                </Muted>
              </View>
            </View>
            <View style={st.actions}>
              {r.lastRun ? (
                <Button
                  label="Print"
                  variant="outlineDark"
                  icon={<PrintIcon size={18} />}
                  onPress={() => router.push({ pathname: '/outputs/print', params: { only: String(r.id) } })}
                  style={st.action}
                  accessibilityLabel={`Print ${r.name}`}
                />
              ) : (
                <Button label="Generate" variant="dark" onPress={() => generateReports([r.id])} style={st.action} accessibilityLabel={`Generate ${r.name}`} />
              )}
              <Button
                label="PDF"
                variant="outline"
                icon={<DownloadIcon color={r.lastRun ? colors.ink : colors.disabledText} />}
                disabled={!r.lastRun}
                onPress={() => run('The PDF', () => shareReportsPdf([buildReport(r, ctx)], 'Letter', 'Portrait'))}
                style={st.action}
                accessibilityLabel={`Download ${r.name} PDF`}
              />
              <Button
                label="CSV"
                variant="outline"
                icon={<DownloadIcon color={r.lastRun ? colors.ink : colors.disabledText} />}
                disabled={!r.lastRun}
                onPress={() => run('The CSV', () => shareReportCsv(buildReport(r, ctx)))}
                style={st.action}
                accessibilityLabel={`Download ${r.name} CSV`}
              />
            </View>
            <Button label="Edit report" variant="outline" onPress={() => setForm(r)} style={{ marginTop: 8, minHeight: 44 }} accessibilityLabel={`Edit ${r.name}`} />
          </Card>
        ))}
      </View>
      {shown.length === 0 && <Muted style={{ marginTop: 12 }}>No reports match your search.</Muted>}
    </AppShell>
  );
}

const TYPES: EodReport['type'][] = ['Order Summary', 'Preparation Sheet V2', '7 Day Order Summary', 'Picking List'];
const AREAS: EodReport['area'][] = ['All production', 'Main Production', 'Second Shift Production'];

function ReportForm({ report, onClose }: { report: EodReport | null; onClose: () => void }) {
  const { saveReport, removeReport } = useStore();
  const [name, setName] = useState(report?.name ?? '');
  const [type, setType] = useState<EodReport['type']>(report?.type ?? 'Order Summary');
  const [area, setArea] = useState<EodReport['area']>(report?.area ?? 'All production');
  const [err, setErr] = useState<string | null>(null);
  return (
    <Card style={{ gap: 14, marginBottom: 16 }}>
      <H2>{report ? 'Edit report' : 'Add a report'}</H2>
      <Field label="Name" value={name} onChangeText={setName} />
      <View style={{ gap: 6 }}>
        <Label>Type</Label>
        <Segmented label="Report type" options={TYPES} value={type} onChange={setType} wrap />
      </View>
      <View style={{ gap: 6 }}>
        <Label>Production area</Label>
        <Segmented label="Production area" options={AREAS} value={area} onChange={setArea} wrap />
      </View>
      {err && <Notice text={err} tone="warn" />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          label="Save"
          onPress={() => {
            if (!name.trim()) return setErr('Give the report a name.');
            saveReport({ id: report?.id, name: name.trim(), type, area });
            onClose();
          }}
          style={{ flex: 1 }}
        />
        <Button label="Cancel" variant="outline" onPress={onClose} />
      </View>
      {report && (
        <Button label="Delete report" variant="danger" onPress={() => confirm('Delete this report?', `${report.name} will be removed from End of day.`, 'Delete', () => { removeReport(report.id); onClose(); })} />
      )}
    </Card>
  );
}

const st = StyleSheet.create({
  selAll: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, marginBottom: 6 },
  selAllText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  name: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  action: { flex: 1, minHeight: 48, paddingHorizontal: 8, borderRadius: 8 },
});
