// Add a customer / Edit customer.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { confirm } from '../../components/OrderForm';
import { Button, Card, Field, H1, Intro, Label, Notice, Segmented } from '../../components/ui';
import { useStore } from '../../data/store';
import { OrderType } from '../../data/types';

export default function EditCustomer() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { customers, saveCustomer, deleteCustomer } = useStore();
  const existing = id ? customers.find((c) => c.id === Number(id)) : undefined;
  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<OrderType>(existing?.type ?? 'Catering');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const done = () => (router.canGoBack() ? router.back() : router.navigate('/customers'));

  const save = () => {
    if (!name.trim()) return setError('Type the customer name.');
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('That email address does not look right.');
    saveCustomer({ id: existing?.id, name: name.trim(), type, email: email.trim(), phone: phone.trim(), address: address.trim(), notes: notes.trim() });
    done();
  };

  return (
    <AppShell section="Customers" sub="Customers" back={{ label: 'Customer list', href: '/customers' }} footer={<Button label={existing ? 'Save changes' : 'Add customer'} onPress={save} big />}>
      <H1 style={{ marginTop: 6 }}>{existing ? 'Edit customer' : 'Add a customer'}</H1>
      <Intro>Email, phone and address are used on invoices and delivery notes.</Intro>
      <Card style={{ gap: 14 }}>
        <Field label="Customer name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Email" placeholder="name@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="Phone number" placeholder="(312) 555-0123" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" />
        <Field label="Address" placeholder="Street, city, state, ZIP" value={address} onChangeText={setAddress} autoComplete="street-address" />
        <Field label="Notes" placeholder="Delivery instructions, allergies, contact person" value={notes} onChangeText={setNotes} multiline />
        <View style={{ gap: 6 }}>
          <Label>Customer type</Label>
          <Segmented<OrderType> label="Customer type" options={['Catering', 'Bakery']} value={type} onChange={setType} stretch />
        </View>
        {error && <Notice text={error} tone="warn" />}
        {existing && (
          <Button
            label="Delete customer"
            variant="danger"
            onPress={() => confirm('Delete this customer?', `${existing.name} will be removed from the customer list. Their past orders stay on the board.`, 'Delete', () => { deleteCustomer(existing.id); done(); })}
          />
        )}
      </Card>
    </AppShell>
  );
}
