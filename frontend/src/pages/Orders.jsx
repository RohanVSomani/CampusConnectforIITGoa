import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GroupOrderModal from '@/components/GroupOrderModal';

export default function Orders() {
  const { user } = useAuth();

  const [openGroups, setOpenGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [placedGroups, setPlacedGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initial form states
  const initialItem = { name: '', quantity: 1, price: 0 };
  const [createForm, setCreateForm] = useState({
    vendor: '',
    vendorLocation: '',
    deliveryLocation: '',
    items: [{ ...initialItem }]
  });

  const [addForm, setAddForm] = useState({
    items: [{ ...initialItem }]
  });

  // Load all dashboard data
  async function loadAll() {
    try {
      const [open, mine] = await Promise.all([
        api.get('/orders/groups/open'),
        api.get('/orders/my')
      ]);

      setOpenGroups(open.data.data || []);
      
      const allMine = mine.data.data || [];
      setMyGroups(allMine.filter(g => g.status === 'open'));
      setPlacedGroups(allMine.filter(g => g.status !== 'open'));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const isLeader = useMemo(() => {
    return activeGroup?.leader?._id === user?._id || activeGroup?.leader === user?._id;
  }, [activeGroup, user]);

  // --- HANDLERS ---

  async function handleCreateGroup(e) {
    e.preventDefault();
    const items = createForm.items.filter(i => i.name.trim());
    if (!items.length) return alert('Add at least one item');

    try {
      await api.post('/orders/group', { ...createForm, items });
      setCreateForm({
        vendor: '',
        vendorLocation: '',
        deliveryLocation: '',
        items: [{ ...initialItem }]
      });
      loadAll();
    } catch (err) {
      alert("Failed to create group");
    }
  }

  async function handleJoinGroup(group) {
    try {
      // Fetch full details (populated) before opening modal
      const res = await api.get(`/orders/group/${group.groupId}`);
      setActiveGroup(res.data.data);
    } catch (err) {
      alert("Could not load group details");
    }
  }

  async function handleAddItems(e) {
    e.preventDefault();
    const items = addForm.items.filter(i => i.name.trim());
    if (!items.length) return alert('Add at least one item');

    setLoading(true);
    try {
      const res = await api.post('/orders/add-items', {
        groupId: activeGroup.groupId,
        items
      });

      // Update the modal instantly with the returned data from backend
      if (res.data.success) {
        setActiveGroup(res.data.data); 
        setAddForm({ items: [{ ...initialItem }] });
        loadAll();
      }
    } catch (err) {
      alert("Failed to add items");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalize() {
    if (!confirm('Finalize this group order? No more items can be added.')) return;

    try {
      await api.patch(`/orders/finalize/${activeGroup.groupId}`);
      setActiveGroup(null);
      loadAll();
    } catch (err) {
      alert("Failed to finalize");
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Campus Group Orders</h1>
        <Button onClick={loadAll} variant="outline" size="sm">Refresh</Button>
      </header>

      {/* CREATE GROUP SECTION */}
      <Card className="border-2 border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl">Start a New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input placeholder="Vendor (e.g. McDonald's)"
                value={createForm.vendor}
                onChange={e => setCreateForm(f => ({ ...f, vendor: e.target.value }))}
                required />
              <Input placeholder="Vendor Location"
                value={createForm.vendorLocation}
                onChange={e => setCreateForm(f => ({ ...f, vendorLocation: e.target.value }))}
                required />
              <Input placeholder="Delivery Point"
                value={createForm.deliveryLocation}
                onChange={e => setCreateForm(f => ({ ...f, deliveryLocation: e.target.value }))}
                required />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your Initial Items:</p>
              {createForm.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Item name" className="flex-1"
                    value={item.name}
                    onChange={e => setCreateForm(f => ({
                      ...f,
                      items: f.items.map((it, j) => j === i ? { ...it, name: e.target.value } : it)
                    }))} required />
                  <Input type="number" min={1} className="w-20" placeholder="Qty"
                    value={item.quantity}
                    onChange={e => setCreateForm(f => ({
                      ...f,
                      items: f.items.map((it, j) => j === i ? { ...it, quantity: +e.target.value } : it)
                    }))} required />
                  <Input type="number" min={0} step={0.01} className="w-24" placeholder="Price"
                    value={item.price}
                    onChange={e => setCreateForm(f => ({
                      ...f,
                      items: f.items.map((it, j) => j === i ? { ...it, price: +e.target.value } : it)
                    }))} required />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm"
                onClick={() => setCreateForm(f => ({
                  ...f,
                  items: [...f.items, { ...initialItem }]
                }))}>
                + Add Another Item
              </Button>
              <Button type="submit" className="ml-auto">Create Group Order</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* DISPLAY GROUPS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* OPEN GROUPS */}
        <section className="space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Available to Join
          </h2>
          {openGroups.length === 0 && <p className="text-sm text-muted-foreground">No active groups nearby.</p>}
          {openGroups.map(g => (
            <Card key={g.groupId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{g.vendor}</h3>
                  <p className="text-xs text-muted-foreground">To: {g.deliveryLocation}</p>
                  <p className="text-xs mt-1 italic">Led by {g.leader?.name}</p>
                </div>
                <Button size="sm" onClick={() => handleJoinGroup(g)}>Join</Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* MY ACTIVE ORDERS */}
        <section className="space-y-4">
          <h2 className="font-bold">My Active Orders</h2>
          {myGroups.length === 0 && <p className="text-sm text-muted-foreground">You haven't joined any groups.</p>}
          {myGroups.map(g => (
            <Card key={g.groupId} className="border-l-4 border-l-blue-500 cursor-pointer hover:bg-accent/50"
              onClick={() => handleJoinGroup(g)}>
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <h3 className="font-bold">{g.vendor}</h3>
                  <Badge variant="outline">OPEN</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Click to add items or view status</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* HISTORY */}
        <section className="space-y-4">
          <h2 className="font-bold text-muted-foreground">Order History</h2>
          {placedGroups.map(g => (
            <Card key={g.groupId} className="opacity-75">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{g.vendor}</h3>
                  <p className="text-xs">{new Date(g.updatedAt).toLocaleDateString()}</p>
                </div>
                <Badge variant="secondary">{g.status.toUpperCase()}</Badge>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      {/* MODAL */}
      {activeGroup && (
        <GroupOrderModal
          group={activeGroup}
          isLeader={isLeader}
          addForm={addForm}
          setAddForm={setAddForm}
          onAddItems={handleAddItems}
          onFinalize={handleFinalize}
          onClose={() => setActiveGroup(null)}
          loading={loading}
        />
      )}
    </div>
  );
}