// Choose a customer for the order being added or edited.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { Badge, Button, Field, H1, Intro, Muted } from '../../components/ui';
import { useStore } from '../../data/store';
import { colors, fonts } from '../../theme';

export default function ChooseCustomer() {
  const { customers, draft, setDraft } = useStore();
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(draft.customer);
  const [typed, setTyped] = useState('');
  const query = q.trim().toLowerCase();
  const rows = customers.filter((c) => !query || c.name.toLowerCase().includes(query));

  const use = () => {
    const name = typed.trim() || picked;
    if (name) {
      const match = customers.find((c) => c.name === name);
      setDraft({ customer: name, ...(match ? { type: match.type } : {}) });
    }
    router.canGoBack() ? router.back() : router.navigate('/orders/edit');
  };

  return (
    <AppShell
      section="Orders"
      sub="Orders"
      back={{ label: 'Back to the order', href: '/orders/edit' }}
      footer={<Button label={typed.trim() ? `Use ${typed.trim()}` : picked ? `Use ${picked}` : 'Use this customer'} onPress={use} disabled={!picked && !typed.trim()} big />}
    >
      <H1 style={{ marginTop: 6 }}>Choose a customer</H1>
      <Intro>The people and businesses you cook for. Tap one to put it on the order.</Intro>
      <Field label="Search customers" hideLabel placeholder="Search customers" value={q} onChangeText={setQ} />
      <View accessibilityRole="radiogroup" accessibilityLabel="Customer list" style={st.list}>
        {rows.map((c) => {
          const on = c.name === picked && !typed.trim();
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, checked: on }}
              onPress={() => {
                setPicked(c.name);
                setTyped('');
              }}
              style={[st.row, on && st.rowOn]}
            >
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{c.name}</Text>
                <Muted>{[c.type, c.phone || 'No phone on file'].join(' · ')}</Muted>
              </View>
              {on && <Badge label="Chosen" bg={colors.red} fg={colors.white} />}
            </Pressable>
          );
        })}
        {rows.length === 0 && <Muted style={{ padding: 16 }}>No customers match your search.</Muted>}
      </View>
      <View style={{ marginTop: 20 }}>
        <Field label="Or type a new customer" value={typed} onChangeText={setTyped} autoCapitalize="words" />
      </View>
    </AppShell>
  );
}

const st = StyleSheet.create({
  list: { marginTop: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  row: { minHeight: 68, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  rowOn: { backgroundColor: colors.activeTint, borderLeftColor: colors.red },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
});
