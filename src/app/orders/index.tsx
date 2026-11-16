// Orders: summary cards, Add an order, and the Order board.
// On a tablet held sideways the Add/Edit form sits beside the board.
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell, useIsWide } from '../../components/AppShell';
import { PlusIcon } from '../../components/icons';
import { OrderCard } from '../../components/OrderCard';
import { OrderForm } from '../../components/OrderForm';
import { Button, Card, H1, H2, Intro, Muted, Notice, Segmented } from '../../components/ui';
import { useStore } from '../../data/store';
import { STATUS_NAMES } from '../../data/types';
import { colors, fonts } from '../../theme';

type Filter = 'All' | 'Catering' | 'Bakery';

export default function Orders() {
  const { orders, startDraft, draft } = useStore();
  const wide = useIsWide();
  const [filter, setFilter] = useState<Filter>('All');
  const [saved, setSaved] = useState<string | null>(null);

  const shown = orders
    .filter((o) => filter === 'All' || o.type === filter)
    .slice()
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || a.id - b.id);

  const summary = (
    <View style={[st.summary, wide && { flexWrap: 'nowrap' }]}>
      {STATUS_NAMES.slice(0, 4).map((name, i) => (
        <View key={name} style={[st.sumCard, wide && { flexBasis: 108, flexGrow: 0 }]}>
          <Text style={st.sumLabel}>{name}</Text>
          <Text style={st.sumValue}>{orders.filter((o) => o.status === i).length}</Text>
        </View>
      ))}
    </View>
  );

  const board = (
    <>
      <View style={st.boardHead}>
        <H2>Order board</H2>
        <Segmented<Filter> label="Filter orders" options={['All', 'Catering', 'Bakery']} value={filter} onChange={setFilter} />
      </View>
      <View style={{ gap: 14 }}>
        {shown.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            wide={wide}
            onEdit={() => {
              startDraft(o.id);
              setSaved(null);
              if (!wide) router.push('/orders/edit');
            }}
          />
        ))}
        {shown.length === 0 && <Muted>No orders here yet.</Muted>}
      </View>
    </>
  );

  if (wide) {
    return (
      <AppShell section="Orders" sub="Orders" scroll={false}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <H1>Orders</H1>
            <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: colors.muted }}>Everything coming in for the bakery and catering.</Text>
          </View>
          {summary}
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 20 }}>
          <ScrollView style={{ flex: 1.45 }} contentContainerStyle={{ paddingBottom: 24 }}>
            {board}
          </ScrollView>
          <Card style={{ flex: 1, padding: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
              <H2>{draft.editingId != null ? `Editing order #${draft.editingId}` : 'Add an order'}</H2>
              {draft.editingId != null && <Button label="Cancel" variant="outline" onPress={() => startDraft(null)} style={{ minHeight: 44 }} />}
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
              {saved && <Notice text={saved} />}
              <OrderForm onDone={() => setSaved(draft.editingId != null ? 'Changes saved.' : 'Order added to the board.')} />
            </ScrollView>
          </Card>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell section="Orders" sub="Orders">
      <H1>Orders</H1>
      <Intro>Everything coming in for the bakery and catering.</Intro>
      {summary}
      <Button
        label="Add an order"
        big
        icon={<PlusIcon />}
        onPress={() => {
          startDraft(null);
          router.push('/orders/edit');
        }}
        style={{ marginTop: 18, marginBottom: 26 }}
      />
      {board}
    </AppShell>
  );
}

const st = StyleSheet.create({
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sumCard: { flexBasis: '45%', flexGrow: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 },
  sumLabel: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.muted },
  sumValue: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  boardHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 },
});
