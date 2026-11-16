// Home: the logo, quick counts and Team messages.
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppShell, useIsWide } from '../components/AppShell';
import { Card, H1, Intro } from '../components/ui';
import { isOpen, useStore } from '../data/store';
import { formatLongDate } from '../lib/dates';
import { colors, fonts } from '../theme';

export default function Home() {
  const { orders, needs, messages, sendMessage } = useStore();
  const wide = useIsWide();
  const [draft, setDraft] = useState('');
  const list = useRef<ScrollViewInstance>(null);

  const send = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
    setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  };

  const welcome = (
    <View style={{ gap: 12, width: wide ? 320 : undefined }}>
      <Card style={{ alignItems: 'center', paddingVertical: wide ? 24 : 18 }}>
        <Image source={require('../../assets/logo.png')} accessibilityLabel="Scratch Kitchen logo" style={{ width: wide ? 150 : 112, height: wide ? 150 : 112, borderRadius: 999 }} />
        <Text style={st.date}>{formatLongDate(new Date())}</Text>
      </Card>
      <View style={{ flexDirection: wide ? 'column' : 'row', gap: 10 }}>
        <Tile value={orders.filter(isOpen).length} label="Open orders" onPress={() => router.navigate('/orders')} />
        <Tile value={needs.filter((n) => !n.done).length} label="Items needed" onPress={() => router.navigate('/needs')} />
      </View>
    </View>
  );

  const messageList = messages.map((m) => (
    <Card key={m.id} style={{ paddingVertical: 14 }}>
      <View style={st.msgHead}>
        <Text style={st.author}>{m.author}</Text>
        <Text style={st.time}>{m.time}</Text>
      </View>
      <Text style={st.msgText}>{m.text}</Text>
    </Card>
  ));

  const composer = (
    <View style={[st.composer, wide && st.composerWide]}>
      <TextInput
        accessibilityLabel="New message"
        placeholder="Message the team"
        placeholderTextColor="#8A7F7A"
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={send}
        returnKeyType="send"
        style={st.input}
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Send to team" onPress={send} style={st.send}>
        <Text style={st.sendText}>{wide ? 'Send to team' : 'Send'}</Text>
      </Pressable>
    </View>
  );

  if (wide) {
    return (
      <AppShell section="Home" sub="Team messages" scroll={false}>
        <View style={{ flex: 1, flexDirection: 'row', gap: 24 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>{welcome}</ScrollView>
          <View style={{ flex: 1 }}>
            <H1>Team messages</H1>
            <Intro>One place for the whole kitchen to share changes and heads-ups.</Intro>
            <ScrollView ref={list} contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
              {messageList}
            </ScrollView>
            {composer}
          </View>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell section="Home" sub="Team messages" scroll={false} footer={composer}>
      <ScrollView ref={list} contentContainerStyle={{ paddingBottom: 20 }} style={{ marginHorizontal: -16, marginTop: -22 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 22 }}>
          {welcome}
          <View style={{ height: 26 }} />
          <H1>Team messages</H1>
          <Intro>One place for the whole kitchen to share changes and heads-ups.</Intro>
          <View style={{ gap: 12 }}>{messageList}</View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

function Tile({ value, label, onPress }: { value: number; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${value} ${label}`} onPress={onPress} style={st.tile}>
      <Text style={st.tileValue}>{value}</Text>
      <Text style={st.tileLabel}>{label} ›</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  date: { marginTop: 10, fontFamily: fonts.regular, fontSize: 15, color: colors.muted },
  tile: { flex: 1, minHeight: 88, padding: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, justifyContent: 'center' },
  tileValue: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  tileLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  msgHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  author: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  time: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  msgText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.ink },
  composer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  composerWide: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 12, marginBottom: 20 },
  input: { flex: 1, minWidth: 0, height: 52, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 999, paddingHorizontal: 16, backgroundColor: colors.cream, fontFamily: fonts.regular, fontSize: 16, color: colors.ink },
  send: { minHeight: 52, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colors.red, justifyContent: 'center' },
  sendText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 15 },
});
