// Add an item to the shopping and supply list.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { Badge, Button, Card, Field, H1, Intro, Label, Muted, Notice, Segmented, Stepper } from '../../components/ui';
import { isLow, useStore } from '../../data/store';
import { Team } from '../../data/types';
import { colors, fonts } from '../../theme';

export default function AddNeed() {
  const { inventory, addNeed } = useStore();
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [qty, setQty] = useState(1);
  const [team, setTeam] = useState<Team>('Baking');
  const [error, setError] = useState<string | null>(null);

  const sorted = inventory.slice().sort((a, b) => Number(isLow(b)) - Number(isLow(a)));

  const add = () => {
    const inv = inventory.find((i) => i.id === picked);
    const item = typed.trim() || (inv ? `${inv.name} (${inv.unit})` : '');
    if (!item) {
      setError('Choose an item from inventory or type one.');
      return;
    }
    addNeed({ item, qty: String(qty), dept: team });
    router.canGoBack() ? router.back() : router.navigate('/needs');
  };

  return (
    <AppShell section="Production" sub="Items needed" back={{ label: 'Items needed', href: '/needs' }} footer={<Button label="Add to list" onPress={add} big />}>
      <H1 style={{ marginTop: 6 }}>Add an item</H1>
      <Intro>Pick it from inventory so nobody has to type it.</Intro>
      <Card style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Label>Choose from inventory</Label>
          <View accessibilityRole="radiogroup" accessibilityLabel="Choose from inventory" style={st.list}>
            {sorted.map((i) => {
              const on = picked === i.id && !typed.trim();
              return (
                <Pressable
                  key={i.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on, checked: on }}
                  onPress={() => {
                    setPicked(i.id);
                    setTyped('');
                    setTeam(i.cat);
                    setQty(Math.max(1, i.par * 2 - i.onHand));
                    setError(null);
                  }}
                  style={[st.row, on && st.rowOn]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={st.name}>
                      {i.name} <Text style={{ fontFamily: fonts.regular, color: colors.muted }}>({i.unit})</Text>
                    </Text>
                    <Muted>
                      On hand {i.onHand} · Reorder at {i.par}
                    </Muted>
                  </View>
                  {isLow(i) && <Badge label="Low" bg={colors.activeTint} fg={colors.redDark} />}
                </Pressable>
              );
            })}
          </View>
        </View>
        <Field label="Or type an item that is not in inventory" placeholder="Item name" value={typed} onChangeText={(t) => { setTyped(t); setError(null); }} />
        <View style={{ gap: 6 }}>
          <Label>Quantity</Label>
          <Stepper value={qty} name="item" size={56} onMinus={() => setQty((q) => Math.max(1, q - 1))} onPlus={() => setQty((q) => q + 1)} />
          <Muted>Suggested from the reorder level. Change it if you need more or less.</Muted>
        </View>
        <View style={{ gap: 6 }}>
          <Label>Team</Label>
          <Segmented<Team> label="Team" options={['Baking', 'Catering']} value={team} onChange={setTeam} stretch />
        </View>
        {error && <Notice text={error} tone="warn" />}
      </Card>
    </AppShell>
  );
}

const st = StyleSheet.create({
  list: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, overflow: 'hidden' },
  row: { minHeight: 60, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.border, borderLeftWidth: 4, borderLeftColor: 'transparent', backgroundColor: colors.white },
  rowOn: { backgroundColor: colors.activeTint, borderLeftColor: colors.red },
  name: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
});
