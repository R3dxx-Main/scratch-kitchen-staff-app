// Print reports: preview, paper and layout, then the phone's own print screen.
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { PrintIcon } from '../../components/icons';
import { Button, Card, Crumb, H1, Intro, Label, Muted, Notice, Segmented } from '../../components/ui';
import { useStore } from '../../data/store';
import { buildReport, Layout, Paper, printReports, shareReportCsv, shareReportsPdf } from '../../lib/reports';
import { colors, fonts } from '../../theme';

export default function PrintScreen() {
  const { only } = useLocalSearchParams<{ only?: string }>();
  const { reports, orders, inventory, today } = useStore();
  const chosen = only ? reports.filter((r) => r.id === Number(only)) : reports.filter((r) => r.selected);
  const tables = useMemo(() => chosen.map((r) => buildReport(r, { orders, inventory, date: today })), [chosen, orders, inventory, today]);
  const [index, setIndex] = useState(0);
  const [paper, setPaper] = useState<Paper>('Letter');
  const [layout, setLayout] = useState<Layout>('Portrait');
  const [msg, setMsg] = useState<string | null>(null);
  const t = tables[Math.min(index, tables.length - 1)];
  const ratio = (paper === 'Letter' ? 8.5 / 11 : 210 / 297) ** (layout === 'Portrait' ? 1 : -1);

  const run = async (label: string, fn: () => Promise<void>) => {
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(`${label} did not finish. ${e instanceof Error ? e.message : ''}`.trim());
    }
  };

  const footer = tables.length ? (
    <>
      <Button
        label={`Print ${tables.length === 1 ? 'report' : `${tables.length} reports`}`}
        icon={<PrintIcon color={colors.white} bg={colors.red} />}
        onPress={() => run('Printing', () => printReports(tables, paper, layout))}
        big
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Save as PDF" variant="outline" onPress={() => run('The PDF', () => shareReportsPdf(tables, paper, layout))} style={{ flex: 1, minHeight: 48 }} />
        <Button label="Download CSV" variant="outline" onPress={() => run('The CSV', () => shareReportCsv(t))} style={{ flex: 1, minHeight: 48 }} accessibilityLabel={`Download ${t.title} as CSV`} />
      </View>
    </>
  ) : undefined;

  return (
    <AppShell section="Outputs" sub="End of day" back={{ label: 'End of day', href: '/outputs' }} footer={footer}>
      <Crumb>Outputs</Crumb>
      <H1>Print reports</H1>
      <Intro>Check the preview, then print. Your phone shows its printers next: AirPrint on iPhone and iPad, or the print service on Android.</Intro>

      {!t ? (
        <Muted>No reports chosen. Go back and select the reports to print.</Muted>
      ) : (
        <>
          {tables.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginBottom: 12 }}>
              <Segmented label="Report to preview" options={tables.map((x) => x.title)} value={t.title} onChange={(v) => setIndex(tables.findIndex((x) => x.title === v))} />
            </ScrollView>
          )}

          <View accessibilityLabel={`Print preview of ${t.title}`} style={st.previewWrap}>
            <View style={[st.page, { aspectRatio: ratio }]}>
              <View style={st.pageHead}>
                <View>
                  <Text style={st.brand}>Scratch Kitchen</Text>
                  <Text style={st.title}>{t.title}</Text>
                </View>
                <Text style={st.sub}>{t.subtitle}</Text>
              </View>
              {t.rows.length === 0 ? (
                <Text style={st.cell}>{t.empty}</Text>
              ) : (
                <View>
                  <View style={[st.tr, { backgroundColor: colors.tableHead }]}>
                    {t.columns.map((c) => (
                      <Text key={c} style={[st.cell, st.th]} numberOfLines={1}>
                        {c}
                      </Text>
                    ))}
                  </View>
                  {t.rows.slice(0, 18).map((r, k) => (
                    <View key={k} style={[st.tr, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                      {r.map((c, j) => (
                        <Text key={j} style={st.cell} numberOfLines={2}>
                          {c}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
          <Muted style={{ textAlign: 'center', marginBottom: 18 }}>
            {t.rows.length} {t.rows.length === 1 ? 'row' : 'rows'}
          </Muted>

          <Card style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Label>Paper size</Label>
              <Segmented<Paper> label="Paper size" options={['Letter', 'A4']} value={paper} onChange={setPaper} stretch />
            </View>
            <View style={{ gap: 6 }}>
              <Label>Layout</Label>
              <Segmented<Layout> label="Layout" options={['Portrait', 'Landscape']} value={layout} onChange={setLayout} stretch />
            </View>
            <Muted>Choose the printer and number of copies on the next screen.</Muted>
          </Card>
          {msg && <Notice text={msg} tone="warn" />}
        </>
      )}
    </AppShell>
  );
}

const st = StyleSheet.create({
  previewWrap: { backgroundColor: colors.border, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 6 },
  page: { width: '100%', maxWidth: 420, backgroundColor: colors.white, padding: 14, overflow: 'hidden', shadowColor: '#2A2323', shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  pageHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 2, borderBottomColor: colors.red, paddingBottom: 6, marginBottom: 8, gap: 8 },
  brand: { fontFamily: fonts.display, fontSize: 13, color: colors.ink },
  title: { fontFamily: fonts.semibold, fontSize: 9, color: colors.ink },
  sub: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 8, color: colors.muted, textAlign: 'right' },
  tr: { flexDirection: 'row' },
  th: { fontFamily: fonts.bold },
  cell: { flex: 1, paddingHorizontal: 3, paddingVertical: 3, fontFamily: fonts.regular, fontSize: 8, color: colors.ink },
});
