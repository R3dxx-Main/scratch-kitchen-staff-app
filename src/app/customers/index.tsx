// Customers: the people and businesses you cook for.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell, useIsWide } from '../../components/AppShell';
import { ChevronIcon, PlusIcon } from '../../components/icons';
import { Badge, Button, Field, H1, H2, Intro, Muted } from '../../components/ui';
import { useStore } from '../../data/store';
import { colors, fonts } from '../../theme';

export default function Customers() {
  const { customers } = useStore();
  const wide = useIsWide();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const rows = customers.filter((c) => !query || [c.name, c.email, c.phone, c.address].some((v) => v.toLowerCase().includes(query)));

  return (
    <AppShell section="Customers" sub="Customers">
      <View style={wide ? { maxWidth: 860 } : undefined}>
        <H1>Customers</H1>
        <Intro>The people and businesses you cook for, with their email, phone number and address.</Intro>
        <Button label="Add a customer" big icon={<PlusIcon />} onPress={() => router.push('/customers/edit')} style={{ marginBottom: 24, alignSelf: wide ? 'flex-start' : 'stretch' }} />
        <H2 style={{ marginBottom: 12 }}>Customer list</H2>
        <Field label="Search customers" hideLabel placeholder="Search customers" value={q} onChangeText={setQ} />
        <View style={st.list}>
          {rows.map((c) => (
            <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={`Edit ${c.name}`} onPress={() => router.push({ pathname: '/customers/edit', params: { id: String(c.id) } })} style={st.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={st.name}>{c.name}</Text>
                  <Badge label={c.type} outline />
                </View>
                <Muted>{c.email || 'No email yet'}</Muted>
                <Muted>{c.phone || 'No phone yet'}</Muted>
                {!!c.address && <Muted>{c.address}</Muted>}
                {!!c.notes && <Muted style={{ fontStyle: 'italic' }}>{c.notes}</Muted>}
              </View>
              <ChevronIcon />
            </Pressable>
          ))}
          {rows.length === 0 && <Muted style={{ padding: 16 }}>No customers match your search.</Muted>}
        </View>
      </View>
    </AppShell>
  );
}

const st = StyleSheet.create({
  list: { marginTop: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  row: { minHeight: 72, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
});
