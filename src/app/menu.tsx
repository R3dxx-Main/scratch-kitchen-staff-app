// Menu: every section of the Staff Hub, grouped like the website's side menu.
import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { ChevronIcon } from '../components/icons';
import { Button, H1, Intro, Muted } from '../components/ui';
import { useAuth } from '../data/auth';
import { useStore } from '../data/store';
import { colors, fonts } from '../theme';

type Item = { label: string; href?: Href; badge?: number };

export default function Menu() {
  const { needs } = useStore();
  const { session, displayName, signOut } = useAuth();
  const openNeeds = needs.filter((n) => !n.done).length;
  const groups: { title: string; items: Item[] }[] = [
    { title: 'Home', items: [{ label: 'Team messages', href: '/' }] },
    { title: 'Orders', items: [{ label: 'Orders', href: '/orders' }, { label: 'Delivery notes' }] },
    { title: 'Customers', items: [{ label: 'Customers', href: '/customers' }] },
    { title: 'Production', items: [{ label: 'Inventory', href: '/inventory' }, { label: 'Items needed', href: '/needs', badge: openNeeds }, { label: 'Prep list' }, { label: 'Recipes' }] },
    { title: 'Menu', items: [{ label: 'Menu items' }] },
    { title: 'Outputs', items: [{ label: 'End of day', href: '/outputs' }, { label: 'Report overview' }, { label: 'Invoicing' }, { label: 'Management' }] },
    { title: 'Invoicing', items: [{ label: 'Invoices' }, { label: 'Payments' }] },
    { title: 'Downloads', items: [{ label: 'Downloads' }] },
    { title: 'Admin', items: [{ label: 'Staff' }, { label: 'Settings' }, { label: 'Support', href: '/support' }] },
  ];

  return (
    <AppShell section="Menu">
      <H1>Menu</H1>
      <Intro>Every part of the Staff Hub. Sections marked Coming soon will be added to the app next.</Intro>
      <View style={{ gap: 14 }}>
        {groups.map((g) => (
          <View key={g.title} style={st.group}>
            <Text accessibilityRole="header" style={st.groupTitle}>
              {g.title}
            </Text>
            {g.items.map((it) =>
              it.href ? (
                <Pressable key={it.label} accessibilityRole="link" onPress={() => router.navigate(it.href!)} style={st.row}>
                  <Text style={st.label}>{it.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {!!it.badge && (
                      <View style={st.count}>
                        <Text style={st.countText}>{it.badge}</Text>
                      </View>
                    )}
                    <ChevronIcon />
                  </View>
                </Pressable>
              ) : (
                <View key={it.label} style={st.row} accessible accessibilityLabel={`${it.label}, coming soon`}>
                  <Text style={[st.label, { color: colors.muted }]}>{it.label}</Text>
                  <Text style={st.soon}>Coming soon</Text>
                </View>
              ),
            )}
          </View>
        ))}
      </View>
      <View style={[st.group, { padding: 16, gap: 10, marginTop: 14 }]}>
        <Text accessibilityRole="header" style={[st.groupTitle, { padding: 0 }]}>Signed in</Text>
        <Muted>
          {displayName} · {session?.user.email}
        </Muted>
        <Button label="Sign out" variant="outlineDark" onPress={signOut} />
      </View>
    </AppShell>
  );
}

const st = StyleSheet.create({
  group: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, overflow: 'hidden' },
  groupTitle: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  row: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border },
  label: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  soon: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
  count: { minWidth: 24, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.countBadge, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
});
