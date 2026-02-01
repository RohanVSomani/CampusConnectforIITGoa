import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GroupOrderModal from '@/components/GroupOrderModal';

export default function Orders() {
  const { user } = useAuth();

  const [openGroups, setOpenGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [placedGroups, setPlacedGroups] = useState([]);

  const [activeGroup, setActiveGroup] = useState(null);

  const [createForm, setCreateForm] = useState({
    vendor: '',
    vendorLocation: '',
    deliveryLocation: '',
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  const [addForm, setAddForm] = useState({
    items: [{ name: '', quantity: 1, price: 0 }]
  });

  async function loadAll() {
    const [open, mine] = await Promise.all([
      api.get('/orders/groups/open'),
      api.get('/orders/my')
    ]);

    setOpenGroups(open.data || []);

    const openMine = mine.data.filter(g => g.status === 'open');
    const placedMine = mine.data.filter(g => g.status === 'placed');

    setMyGroups(openMine);
    setPlacedGroups(placedMine);
  }

  async function loadGroup(groupId) {
    const res = await api.get(`/orders/group/${groupId}`);
    setActiveGroup(res.data);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const isLeader = useMemo(() => {
    return activeGroup?.leader?._id === user?._id;
  }, [activeGroup, user]);


  async function handleCreateGroup(e) {
    e.preventDefault();

    const items = createForm.items.filter(i => i.name.trim());
    if (!items.length) return alert('Add at least one item');

    await api.post('/orders/group', { ...createForm, items });

    setCreateForm({
      vendor: '',
      vendorLocation: '',
      deliveryLocation: '',
      items: [{ name: '', quantity: 1, price: 0 }]
    });

    loadAll();
  }


  async function handleJoinGroup(group) {
    setActiveGroup(group);
    loadGroup(group.groupId);
  }


  async function handleAddItems(e) {

    const items = addForm.items.filter(i => i.name.trim());
    if (!items.length) return alert('Add at least one item');

    await api.post('/orders/add-items', {
      groupId: activeGroup.groupId,
      items
    });

    setAddForm({ items: [{ name: '', quantity: 1, price: 0 }] });
    loadGroup(activeGroup.groupId);
    loadAll();
  }


  async function handleFinalize() {
    if (!confirm('Finalize this group order?')) return;

    await api.patch(`/orders/finalize/${activeGroup.groupId}`);

    setActiveGroup(null);
    loadAll();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Campus Group Orders</h1>

      <Card>
        <CardHeader>Create Group</CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGroup} className="space-y-4">

            <Input placeholder="Vendor"
              value={createForm.vendor}
              onChange={e => setCreateForm(f => ({ ...f, vendor: e.target.value }))}
              required />

            <Input placeholder="Vendor Location"
              value={createForm.vendorLocation}
              onChange={e => setCreateForm(f => ({ ...f, vendorLocation: e.target.value }))}
              required />

            <Input placeholder="Delivery Location"
              value={createForm.deliveryLocation}
              onChange={e => setCreateForm(f => ({ ...f, deliveryLocation: e.target.value }))}
              required />

            {createForm.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Item"
                  value={item.name}
                  onChange={e =>
                    setCreateForm(f => ({
                      ...f,
                      items: f.items.map((it, j) =>
                        j === i ? { ...it, name: e.target.value } : it
                      )
                    }))
                  }
                  required />

                <Input type="number" min={1} className="w-20"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e =>
                    setCreateForm(f => ({
                      ...f,
                      items: f.items.map((it, j) =>
                        j === i ? { ...it, quantity: +e.target.value } : it
                      )
                    }))
                  }
                  required />


                <Input type="number" min={0} step={0.01} className="w-24"
                  placeholder="Price"
                  value={item.price}
                  onChange={e =>
                    setCreateForm(f => ({
                      ...f,
                      items: f.items.map((it, j) =>
                        j === i ? { ...it, price: +e.target.value } : it
                      )
                    }))
                  }
                  required />
              </div>
            ))}

            <Button type="button" variant="outline"
              onClick={() =>
                setCreateForm(f => ({
                  ...f,
                  items: [...f.items, { name: '', quantity: 1, price: 0 }]
                }))
              }>
              Add Item
            </Button>

            <Button>Create Group</Button>

          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Open Groups</CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {openGroups.map(g => (
            <Card key={g.groupId} className="p-3">
              <Badge>OPEN</Badge>
              <h3 className="font-semibold">{g.vendor}</h3>
              <Button size="sm" onClick={() => handleJoinGroup(g)}>Join</Button>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>My Orders</CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myGroups.map(g => (
            <Card key={g.groupId} className="p-3 cursor-pointer"
              onClick={() => handleJoinGroup(g)}>
              <Badge>OPEN</Badge>
              <h3 className="font-semibold">{g.vendor}</h3>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Placed Orders</CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {placedGroups.map(g => (
            <Card key={g.groupId} className="p-3">
              <Badge variant="secondary">PLACED</Badge>
              <h3 className="font-semibold">{g.vendor}</h3>
            </Card>
          ))}
        </CardContent>
      </Card>

      {activeGroup && (
        <GroupOrderModal
          group={activeGroup}
          isLeader={isLeader}
          addForm={addForm}
          setAddForm={setAddForm}
          onAddItems={handleAddItems}
          onFinalize={handleFinalize}
          onClose={() => setActiveGroup(null)}
        />
      )}

    </div>
  );
}
