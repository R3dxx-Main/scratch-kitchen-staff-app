// Add an order / Editing order #… on phones.
import { router } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { OrderForm } from '../../components/OrderForm';
import { Card, H1, Intro } from '../../components/ui';
import { useStore } from '../../data/store';

export default function EditOrder() {
  const { draft } = useStore();
  const editing = draft.editingId != null;
  const done = () => (router.canGoBack() ? router.back() : router.navigate('/orders'));
  return (
    <AppShell section="Orders" sub="Orders" back={{ label: 'Order board', href: '/orders' }}>
      <H1 style={{ marginTop: 6 }}>{editing ? `Editing order #${draft.editingId}` : 'Add an order'}</H1>
      <Intro>{editing ? 'Change anything, then save. The order will show Changed on the board.' : 'Pick the customer, then tap + to add what they ordered.'}</Intro>
      <Card>
        <OrderForm onDone={done} />
      </Card>
    </AppShell>
  );
}
