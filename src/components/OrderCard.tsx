import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ACTION_NAMES, Order, STATUS_NAMES } from '../data/types';
import { useStore, useOrderItemsLabel } from '../data/store';
import { formatDue } from '../lib/dates';
import { colors, fonts, stageBadge } from '../theme';
import { Badge, Button, Card } from './ui';

export function OrderCard({ order, onEdit, wide }: { order: Order; onEdit: () => void; wide?: boolean }) {
  const { advanceOrder, skipDay, restoreDay, stopRepeating } = useStore();
  const itemsLabel = useOrderItemsLabel();
  const repeats = order.repeat !== 'Does not repeat';
  const locked = order.status >= 3;
  const badge = stageBadge[order.status];

  const details = (
    <View style={{ flex: 1, minWidth: 0 }}>
      <View style={st.tags}>
        <Text style={st.id}>#{order.id}</Text>
        <Badge label={order.type} outline />
        <Badge label={STATUS_NAMES[order.status]} bg={badge.bg} fg={badge.fg} />
        {order.edited && <Badge label="Changed" bg="#F7DFA5" fg="#4A3500" />}
        {repeats && <Badge label={`Repeats ${order.repeat.replace('Every ', 'every ')} until canceled`} bg={colors.blueBg} fg={colors.blueText} />}
      </View>
      <Text style={st.customer}>{order.customer}</Text>
      {!!itemsLabel(order) && <Text style={st.items}>{itemsLabel(order)}</Text>}
      <Text style={st.due}>
        <Text style={{ fontFamily: fonts.semibold }}>Due: </Text>
        {formatDue(order.dueDate, order.dueTime)}
      </Text>
    </View>
  );

  const actions = (
    <View style={[{ gap: 8 }, wide ? { width: 200 } : { marginTop: 14 }]}>
      <Button
        label={ACTION_NAMES[order.status]}
        variant="dark"
        disabled={locked}
        onPress={() => advanceOrder(order.id)}
        accessibilityLabel={locked ? undefined : `${ACTION_NAMES[order.status]} for order ${order.id}`}
      />
      <View style={{ flexDirection: wide ? 'column' : 'row', gap: 8 }}>
        <Button label="Edit order" variant="outlineDark" onPress={onEdit} style={!wide && { flex: 1 }} accessibilityLabel={`Edit order ${order.id}`} />
        {repeats && order.status < 3 && <Button label="Skip this day" variant="outlineDark" onPress={() => skipDay(order.id)} style={!wide && { flex: 1 }} />}
        {order.status === 4 && <Button label="Restore this day" variant="outlineDark" onPress={() => restoreDay(order.id)} style={!wide && { flex: 1 }} />}
      </View>
      {repeats && <Button label="Stop repeating" variant="outline" onPress={() => stopRepeating(order.id)} />}
    </View>
  );

  return (
    <Card style={wide ? { flexDirection: 'row', gap: 16, alignItems: 'center' } : undefined}>
      {details}
      {actions}
    </Card>
  );
}

const st = StyleSheet.create({
  tags: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 8 },
  id: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  customer: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  items: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.muted, marginTop: 2 },
  due: { fontFamily: fonts.regular, fontSize: 15, color: colors.ink, marginTop: 6 },
});
