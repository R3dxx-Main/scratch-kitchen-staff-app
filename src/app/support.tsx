// Support: quick answers for the team, from the Staff Hub.
import { View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { Body, Card, H1, H2, Intro } from '../components/ui';

const QA = [
  { q: 'How do I add an order?', a: 'Open Orders and tap Add an order.' },
  { q: 'How do I ask for supplies?', a: 'Open Items needed and tap Add an item.' },
  { q: 'How do I print the end of day reports?', a: 'Open Outputs, select the reports, then tap Print selected.' },
  { q: 'Who do I ask for help?', a: '[Manager name and phone]' },
];

export default function Support() {
  return (
    <AppShell section="Menu" back={{ label: 'Back', href: '/menu' }}>
      <H1 style={{ marginTop: 6 }}>Support</H1>
      <Intro>Quick answers for the team.</Intro>
      <View style={{ gap: 12 }}>
        {QA.map((x) => (
          <Card key={x.q} style={{ gap: 4 }}>
            <H2 style={{ fontSize: 18, lineHeight: 24 }}>{x.q}</H2>
            <Body>{x.a}</Body>
          </Card>
        ))}
      </View>
    </AppShell>
  );
}
