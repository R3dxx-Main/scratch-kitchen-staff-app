// Inventory: counts with + and −, cost, value on hand, and Send to production.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell, useIsWide } from '../components/AppShell';
import { confirm } from '../components/OrderForm';
import { Badge, Button, Card, Field, H1, H2, Intro, Label, Muted, Notice, Segmented, Stepper } from '../components/ui';
import { isLow, useStore } from '../data/store';
import { InventoryItem, PRODUCTION_AREAS, ProductionArea, Team } from '../data/types';
import { colors, fonts } from '../theme';

type Tab = 'All items' | 'Main Production' | 'Second Shift Production' | 'Not assigned';
const money = (n: number) => `$${n.toFixed(2)}`;

export default function Inventory() {
  const { inventory } = useStore();
  const wide = useIsWide();
  const [tab, setTab] = useState<Tab>('All items');
  const [adding, setAdding] = useState(false);

  const shown = inventory.filter((i) => {
    if (tab === 'All items') return true;
    if (tab === 'Not assigned') return i.prod === 'Not assigned';
    return i.prod === tab || i.prod === 'Both';
  });

  return (
    <AppShell section="Production" sub="Inventory">
      <H1>Inventory</H1>
      <Intro>Everything you keep in stock. Add it here once, then pick from this list when you add an order or ask for supplies.</Intro>
      {adding ? <AddItem onClose={() => setAdding(false)} /> : <Button label="Add an inventory item" onPress={() => setAdding(true)} big style={{ marginBottom: 24, alignSelf: wide ? 'flex-start' : 'stretch' }} />}

      <H2 style={{ marginBottom: 12 }}>Stock list</H2>
      <Segmented<Tab> label="Show items by production area" options={['All items', 'Main Production', 'Second Shift Production', 'Not assigned']} value={tab} onChange={setTab} wrap />
      <View style={[{ gap: 12, marginTop: 14 }, wide && { flexDirection: 'row', flexWrap: 'wrap' }]}>
        {shown.map((i) => (
          <ItemCard key={i.id} item={i} wide={wide} />
        ))}
      </View>
      {shown.length === 0 && <Muted style={{ marginTop: 12 }}>No items sent to this production area yet. Use Send to production on an item.</Muted>}
    </AppShell>
  );
}

function ItemCard({ item: i, wide }: { item: InventoryItem; wide: boolean }) {
  const { changeOnHand, setCost, setProduction, requestInventoryItem, removeInventory } = useStore();
  const [costText, setCostText] = useState(i.cost != null ? i.cost.toFixed(2) : '');
  const [added, setAdded] = useState(false);
  const low = isLow(i);

  const commitCost = () => {
    const n = parseFloat(costText.replace(/[^0-9.]/g, ''));
    setCost(i.id, isNaN(n) ? null : n);
    if (!isNaN(n)) setCostText(n.toFixed(2));
  };

  return (
    <Card style={[{ gap: 12 }, wide && { width: '48.5%' }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={st.name}>{i.name}</Text>
          <Muted>
            {i.cat} · {i.unit}
          </Muted>
        </View>
        <Badge label={low ? 'Reorder' : 'In stock'} bg={low ? colors.activeTint : colors.successBg} fg={low ? colors.redDark : colors.successText} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View>
          <Label>On hand</Label>
          <Muted>Reorder at {i.par}</Muted>
        </View>
        <Stepper value={i.onHand} name={i.name} size={52} onMinus={() => changeOnHand(i.id, -1)} onPlus={() => changeOnHand(i.id, 1)} />
      </View>

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <Field label="Cost per unit ($)" placeholder="0.00" keyboardType="decimal-pad" value={costText} onChangeText={setCostText} onBlur={commitCost} onSubmitEditing={commitCost} />
        </View>
        <View style={{ flex: 1, paddingBottom: 14 }}>
          <Label>Value on hand</Label>
          <Text style={st.value}>{i.cost != null ? money(i.cost * i.onHand) : 'Set a cost'}</Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Label>Send to production</Label>
        <Segmented<ProductionArea> label={`Send ${i.name} to production`} options={PRODUCTION_AREAS} value={i.prod} onChange={(v) => setProduction(i.id, v)} wrap />
      </View>

      {added && <Notice text="Added to Items needed." />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Add to items needed" variant="outlineDark" onPress={() => { requestInventoryItem(i.id); setAdded(true); }} style={{ flex: 1 }} />
        <Button label="Remove" variant="outline" onPress={() => confirm('Remove this item?', `${i.name} will be taken off the stock list.`, 'Remove', () => removeInventory(i.id))} />
      </View>
    </Card>
  );
}

function AddItem({ onClose }: { onClose: () => void }) {
  const { addInventory } = useStore();
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [onHand, setOnHand] = useState('');
  const [cost, setCostVal] = useState('');
  const [par, setPar] = useState('');
  const [cat, setCat] = useState<Team>('Baking');
  const [prod, setProd] = useState<ProductionArea>('Not assigned');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    if (!name.trim()) return setError('Give the item a name.');
    const c = parseFloat(cost);
    addInventory({ name: name.trim(), unit: unit.trim() || 'each', onHand: parseInt(onHand, 10) || 0, par: parseInt(par, 10) || 0, cost: isNaN(c) ? null : c, cat, prod });
    onClose();
  };

  return (
    <Card style={{ gap: 14, marginBottom: 24 }}>
      <H2>Add an inventory item</H2>
      <Field label="Item name" value={name} onChangeText={setName} />
      <Field label="Unit" placeholder="50 lb bag, dozen, each" value={unit} onChangeText={setUnit} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label="On hand" keyboardType="number-pad" value={onHand} onChangeText={setOnHand} /></View>
        <View style={{ flex: 1 }}><Field label="Reorder at or below" keyboardType="number-pad" value={par} onChangeText={setPar} /></View>
      </View>
      <Field label="Cost per unit ($)" placeholder="0.00" keyboardType="decimal-pad" value={cost} onChangeText={setCostVal} />
      <View style={{ gap: 6 }}>
        <Label>Send to production</Label>
        <Segmented<ProductionArea> label="Send to production" options={PRODUCTION_AREAS} value={prod} onChange={setProd} wrap />
      </View>
      <View style={{ gap: 6 }}>
        <Label>Team</Label>
        <Segmented<Team> label="Team" options={['Baking', 'Catering']} value={cat} onChange={setCat} stretch />
      </View>
      {error && <Notice text={error} tone="warn" />}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label="Add to inventory" onPress={add} style={{ flex: 1 }} />
        <Button label="Cancel" variant="outline" onPress={onClose} />
      </View>
    </Card>
  );
}

const st = StyleSheet.create({
  name: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  value: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, marginTop: 4 },
});
