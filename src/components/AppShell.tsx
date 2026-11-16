/**
 * The frame around every screen, matched to the Staff Hub website:
 * red top bar with the logo, a section menu row, and
 * - on phones: a dark bottom bar with the website's section icons
 * - on wide screens (tablet held sideways): the website's dark icon rail on the left.
 */
import { Href, router, usePathname } from 'expo-router';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../data/store';
import { colors, fonts, TAP, WIDE_BREAKPOINT } from '../theme';
import { BackIcon, CustomersIcon, HomeIcon, MenuIcon, OrdersIcon, OutputsIcon, ProductionIcon } from './icons';

export type Section = 'Home' | 'Orders' | 'Customers' | 'Production' | 'Outputs' | 'Menu';

const SECTIONS: { key: Section; href: Href; Icon: React.ComponentType<{ size?: number; color?: string; bg?: string }>; phone: boolean }[] = [
  { key: 'Home', href: '/', Icon: HomeIcon, phone: true },
  { key: 'Orders', href: '/orders', Icon: OrdersIcon, phone: true },
  { key: 'Customers', href: '/customers', Icon: CustomersIcon, phone: false },
  { key: 'Production', href: '/needs', Icon: ProductionIcon, phone: true },
  { key: 'Outputs', href: '/outputs', Icon: OutputsIcon, phone: true },
  { key: 'Menu', href: '/menu', Icon: MenuIcon, phone: true },
];

type SubItem = { label: string; href: Href; badge?: number };

function useSubMenus(): Record<Section, SubItem[]> {
  const { needs } = useStore();
  const openNeeds = needs.filter((n) => !n.done).length;
  return {
    Home: [
      { label: 'Team messages', href: '/' },
      { label: 'Orders', href: '/orders' },
      { label: 'Inventory', href: '/inventory' },
      { label: 'Items needed', href: '/needs', badge: openNeeds },
    ],
    Orders: [{ label: 'Orders', href: '/orders' }],
    Customers: [{ label: 'Customers', href: '/customers' }],
    Production: [
      { label: 'Inventory', href: '/inventory' },
      { label: 'Items needed', href: '/needs', badge: openNeeds },
    ],
    Outputs: [{ label: 'End of day', href: '/outputs' }],
    Menu: [],
  };
}

export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}

export function AppShell({
  section,
  sub,
  children,
  footer,
  scroll = true,
  back,
}: {
  section: Section;
  /** Which item of the section menu is current. */
  sub?: string;
  children: React.ReactNode;
  /** Pinned under the content, above the bottom bar (e.g. a Save button). */
  footer?: React.ReactNode;
  scroll?: boolean;
  /** Shows a back link at the top of the content. */
  back?: { label: string; href?: Href };
}) {
  const insets = useSafeAreaInsets();
  const wide = useIsWide();
  const menus = useSubMenus();
  const items = menus[section];

  const content = (
    <View style={{ flex: 1 }}>
      {items.length > 1 && <SectionMenu items={items} active={sub} />}
      <StatusLine />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={[st.content, wide && st.contentWide]} keyboardShouldPersistTaps="handled">
            {back && <BackLink {...back} />}
            {children}
          </ScrollView>
        ) : (
          <View style={[st.content, wide && st.contentWide, { flex: 1, paddingBottom: 0 }]}>
            {back && <BackLink {...back} />}
            {children}
          </View>
        )}
        {footer && <View style={st.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <View style={st.root}>
      <TopBar topInset={insets.top} wide={wide} />
      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Rail active={section} bottomInset={insets.bottom} />
          {content}
        </View>
      ) : (
        <>
          {content}
          <BottomBar active={section} bottomInset={insets.bottom} />
        </>
      )}
    </View>
  );
}

/** "Loading…" while data arrives, and a message if something was not saved. */
function StatusLine() {
  const { loading, error, clearError } = useStore();
  if (error) {
    return (
      <View accessibilityLiveRegion="assertive" style={[st.status, { backgroundColor: colors.activeTint }]}>
        <Text style={[st.statusText, { color: colors.redDark }]}>{error}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={clearError} style={st.statusBtn}>
          <Text style={[st.statusText, { color: colors.redDark, fontFamily: fonts.bold }]}>OK</Text>
        </Pressable>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={st.status}>
        <Text style={st.statusText}>Loading the latest from the kitchen…</Text>
      </View>
    );
  }
  return null;
}

function TopBar({ topInset, wide }: { topInset: number; wide: boolean }) {
  const { userName } = useStore();
  return (
    <View style={[st.top, { paddingTop: topInset + 8 }]}>
      <View style={st.topLeft}>
        <Image source={require('../../assets/logo.png')} accessibilityLabel="Scratch Kitchen logo" style={st.logo} />
        <Text style={st.topTitle}>Staff Hub</Text>
      </View>
      <View style={st.topLeft}>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/support')} style={st.support}>
          <Text style={st.supportText}>Support</Text>
        </Pressable>
        {wide && <Text style={st.userName}>{userName}</Text>}
      </View>
    </View>
  );
}

function SectionMenu({ items, active }: { items: SubItem[]; active?: string }) {
  return (
    <View style={st.subWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 4 }} accessibilityRole="tablist">
        {items.map((it) => {
          const on = it.label === active;
          return (
            <Pressable
              key={it.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => !on && router.navigate(it.href)}
              style={[st.subItem, on && st.subItemOn]}
            >
              <Text style={[st.subText, on && st.subTextOn]}>{it.label}</Text>
              {!!it.badge && (
                <View style={st.count}>
                  <Text style={st.countText}>{it.badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function BottomBar({ active, bottomInset }: { active: Section; bottomInset: number }) {
  return (
    <View accessibilityRole="tablist" style={[st.bottom, { paddingBottom: Math.max(bottomInset, 10) }]}>
      {SECTIONS.filter((x) => x.phone).map(({ key, href, Icon }) => {
        const on = key === active;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => router.navigate(href)}
            style={[st.tab, on && { backgroundColor: colors.red }]}
          >
            <Icon size={24} bg={on ? colors.red : colors.ink} />
            <Text style={[st.tabText, on && { fontFamily: fonts.bold }]}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Rail({ active, bottomInset }: { active: Section; bottomInset: number }) {
  return (
    <View accessibilityRole="tablist" style={[st.rail, { paddingBottom: bottomInset + 10 }]}>
      {SECTIONS.map(({ key, href, Icon }) => {
        const on = key === active;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => router.navigate(href)}
            style={[st.railItem, on && { backgroundColor: colors.red }]}
          >
            <Icon size={24} bg={on ? colors.red : colors.ink} />
            <Text style={[st.tabText, { fontSize: 11 }, on && { fontFamily: fonts.bold }]}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function BackLink({ label, href }: { label: string; href?: Href }) {
  const pathname = usePathname();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => (router.canGoBack() ? router.back() : router.navigate(href ?? '/'))}
      style={st.back}
      key={pathname}
    >
      <BackIcon />
      <Text style={st.backText}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  top: { backgroundColor: colors.red, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.white },
  topTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.white },
  support: { minHeight: 44, paddingHorizontal: 18, borderWidth: 2, borderColor: colors.white, borderRadius: 999, justifyContent: 'center' },
  supportText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 14 },
  userName: { color: colors.white, fontFamily: fonts.regular, fontSize: 15 },
  subWrap: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  subItem: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  subItemOn: { backgroundColor: colors.activeTint, borderBottomColor: colors.red },
  subText: { fontFamily: fonts.medium, fontSize: 15, color: colors.menuText },
  subTextOn: { fontFamily: fonts.bold, color: colors.ink },
  count: { minWidth: 24, height: 24, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.countBadge, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink },
  content: { padding: 16, paddingTop: 22, paddingBottom: 40 },
  contentWide: { paddingHorizontal: 24 },
  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  bottom: { flexDirection: 'row', gap: 4, backgroundColor: colors.ink, paddingHorizontal: 8, paddingTop: 8 },
  tab: { flex: 1, minHeight: 58, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabText: { color: colors.railIcon, fontFamily: fonts.medium, fontSize: 12 },
  rail: { width: 84, backgroundColor: colors.ink, alignItems: 'center', gap: 4, paddingTop: 10 },
  railItem: { width: 72, minHeight: 66, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.tableHead },
  statusText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  statusBtn: { minHeight: 44, minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  back: { alignSelf: 'flex-start', minHeight: TAP, flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: -6, paddingRight: 8, marginTop: -10 },
  backText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
});
