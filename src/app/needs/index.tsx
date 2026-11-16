// Items needed: the shopping and supply list.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell, useIsWide } from '../../components/AppShell';
import { CheckIcon, PlusIcon } from '../../components/icons';
import { Badge, Button, H1, H2, Intro, Muted } from '../../components/ui';
import { useStore } from '../../data/store';
import { colors, fonts } from '../../theme';

export default function Needs() {
  const { needs, toggleNeed, clearDoneNeeds } = useStore();
  const wide = useIsWide();
  const hasDone = needs.some((n) => n.done);

  return (
    <AppShell section="Production" sub="Items needed">
      <View style={wide ? { maxWidth: 820 } : undefined}>
        <H1>Items needed</H1>
        <Intro>Supplies the baking and catering teams need ordered or restocked.</Intro>
        <Button label="Add an item" big icon={<PlusIcon />} onPress={() => router.push('/needs/add')} style={{ marginBottom: 26, alignSelf: wide ? 'flex-start' : 'stretch' }} />

        <View style={st.head}>
          <H2>Shopping and supply list</H2>
          {hasDone && (
            <Pressable accessibilityRole="button" onPress={clearDoneNeeds} style={st.clear}>
              <Text style={st.clearText}>Clear done</Text>
            </Pressable>
          )}
        </View>
        <View style={{ gap: 10 }}>
          {needs.map((n) => (
            <Pressable key={n.id} onPress={() => toggleNeed(n.id)} accessibilityRole="checkbox" accessibilityState={{ checked: n.done }} accessibilityLabel={`${n.item}, quantity ${n.qty}, ${n.dept}`} style={[st.row, n.done && { backgroundColor: '#F3EEEA' }]}>
              <View accessible={false} importantForAccessibility="no-hide-descendants" style={[st.box, n.done && { backgroundColor: colors.red, borderColor: colors.red }]}>
                {n.done && <CheckIcon size={20} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[st.item, n.done && { textDecorationLine: 'line-through', color: colors.muted }]}>{n.item}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <Muted>Qty: {n.qty}</Muted>
                  <Badge label={n.dept} outline />
                </View>
              </View>
            </Pressable>
          ))}
          {needs.length === 0 && <Muted>Nothing on the list. Add an item when something runs low.</Muted>}
        </View>
      </View>
    </AppShell>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  clear: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  clearText: { fontFamily: fonts.bold, fontSize: 14, color: colors.redDark },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14 },
  box: { width: 30, height: 30, borderWidth: 2.5, borderColor: colors.ink, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  item: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
});
