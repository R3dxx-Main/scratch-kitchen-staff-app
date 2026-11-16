// The Add an order / Editing order form, used on its own screen (phone)
// and beside the order board (tablet held sideways).
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../data/store';
import { OrderType, Repeat, REPEAT_OPTIONS } from '../data/types';
import { addDays, parseISODate } from '../lib/dates';
import { colors, fonts } from '../theme';
import { ChevronIcon } from './icons';
import { Button, Field, Label, Muted, Notice, Segmented, Stepper } from './ui';

export function confirm(title: string, message: string, ok: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onOk();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: ok, style: 'destructive', onPress: onOk },
  ]);
}

export function OrderForm({ onDone }: { onDone: () => void }) {
  const { draft, setDraft, saveDraft, inventory, deleteOrder, today } = useStore();
  const [error, setError] = useState<string | null>(null);
  const editing = draft.editingId != null;
  const repeats = draft.repeat !== 'Does not repeat';

  const save = () => {
    if (draft.dueDate && !parseISODate(draft.dueDate)) {
      setError('Type the due date as year-month-day, for example 2026-11-24.');
      return;
    }
    const msg = saveDraft();
    setError(msg);
    if (!msg) onDone();
  };

  const setQty = (id: number, d: number) => setDraft({ qty: { ...draft.qty, [id]: Math.max(0, (draft.qty[id] || 0) + d) } });

  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 4 }}>
        <Label>Choose a customer</Label>
        <Pressable accessibilityRole="button" accessibilityLabel={`Customer: ${draft.customer || 'none chosen'}. Choose from your customer list`} onPress={() => router.push('/orders/customer')} style={st.chooser}>
          <Text style={[st.chooserText, !draft.customer && { color: colors.muted, fontFamily: fonts.regular }]}>{draft.customer || 'Choose from your customer list'}</Text>
          <ChevronIcon />
        </Pressable>
      </View>
      <Field label={editing ? 'Customer name' : 'Or type a new customer'} value={draft.customer} onChangeText={(t) => setDraft({ customer: t })} autoCapitalize="words" />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field label="Due date" placeholder="2026-11-24" value={draft.dueDate} onChangeText={(t) => setDraft({ dueDate: t })} keyboardType="numbers-and-punctuation" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Time or note" placeholder="10:00 AM" value={draft.dueTime} onChangeText={(t) => setDraft({ dueTime: t })} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: -6 }}>
        <Button label="Today" variant="outline" onPress={() => setDraft({ dueDate: today })} style={{ minHeight: 44, paddingHorizontal: 16 }} />
        <Button label="Tomorrow" variant="outline" onPress={() => setDraft({ dueDate: addDays(today, 1) })} style={{ minHeight: 44, paddingHorizontal: 16 }} />
      </View>

      <View style={{ gap: 6 }}>
        <Label>{editing ? 'What they ordered (use + and − to change quantities)' : 'What they ordered (tap + to add from inventory)'}</Label>
        {inventory.map((i) => (
          <View key={i.id} style={st.pickRow}>
            <Text style={st.pickName}>
              {i.name} <Text style={{ fontFamily: fonts.regular, color: colors.muted }}>({i.unit})</Text>
            </Text>
            <Stepper value={draft.qty[i.id] || 0} name={i.name} onMinus={() => setQty(i.id, -1)} onPlus={() => setQty(i.id, 1)} />
          </View>
        ))}
      </View>

      <Field label="Notes" placeholder="Allergies, special requests, anything not in inventory" value={draft.notes} onChangeText={(t) => setDraft({ notes: t })} multiline />

      <View style={{ gap: 6 }}>
        <Label>Repeat this order</Label>
        <Segmented<Repeat> label="Repeat this order" options={REPEAT_OPTIONS} value={draft.repeat} onChange={(v) => setDraft({ repeat: v })} wrap />
        {repeats && !editing && <Muted>Keeps going until you stop it. Use Stop repeating on any order in the series to cancel the rest.</Muted>}
      </View>

      {editing && repeats && (
        <View style={st.scope}>
          <Label>This order repeats until canceled. Apply your changes to:</Label>
          <Segmented
            label="Apply changes to"
            options={['This order only', 'This and all later repeats'] as const}
            value={draft.scope === 'later' ? 'This and all later repeats' : 'This order only'}
            onChange={(v) => setDraft({ scope: v === 'This order only' ? 'one' : 'later' })}
            wrap
          />
        </View>
      )}

      <View style={{ gap: 6 }}>
        <Label>Order type</Label>
        <Segmented<OrderType> label="Order type" options={['Catering', 'Bakery']} value={draft.type} onChange={(v) => setDraft({ type: v })} stretch />
      </View>

      {error && <Notice text={error} tone="warn" />}
      <Button label={editing ? 'Save changes' : 'Add order'} onPress={save} big />
      {editing && (
        <Button
          label="Delete order"
          variant="danger"
          onPress={() =>
            confirm('Delete this order?', `Order #${draft.editingId} will be removed from the board. This can't be undone.`, 'Delete', () => {
              deleteOrder(draft.editingId!);
              onDone();
            })
          }
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  chooser: { minHeight: 56, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  chooserText: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  pickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingLeft: 12, paddingRight: 6, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.cream },
  pickName: { flex: 1, fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  scope: { gap: 8, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.cream },
});
