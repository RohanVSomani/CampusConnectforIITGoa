

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RequestCard from '@/components/RequestCard';

export default function Requests() {
  
  const [list, setList] = useState([]);
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'errand',
    fromLocation: '',
    toLocation: '',
    rewardCredits: 0,
  });

  async function fetchList() {
    try {
      const [res, my] = await Promise.all([
        api.get('/errands?status=open'),
        api.get('/errands/my'),
      ]);
      setList(res.data || []);
      setMyList(my.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/errands', form);
      setOpen(false);
      setForm({ title: '', description: '', type: 'errand', fromLocation: '', toLocation: '', rewardCredits: 0 });
      fetchList();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleClaim(r) {
    try {
      await api.post(`/errands/${r._id}/claim`);
      fetchList();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleComplete(r) {
    try {
      await api.patch(`/errands/${r._id}`, {
        status: 'completed',
      });
      fetchList();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }
  
  
  

  async function handleCancel(r) {
    const status = r.status === 'open' ? 'cancelled' : 'open';
  
    const msg =
      status === 'cancelled'
        ? 'This will cancel this request. Continue?'
        : 'This will remove the current helper and reopen the request. Continue?';
  
    if (!confirm(msg)) return;
  
    try {
      await api.patch(`/errands/${r._id}`, { status });
      fetchList();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requests</h1>
          <p className="text-muted-foreground">Item & errand requests</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New request</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create request</DialogTitle>
              <DialogDescription>Post an item or errand request.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Pick up package"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="errand">Errand</option>
                  <option value="item">Item</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    value={form.fromLocation}
                    onChange={(e) => setForm((f) => ({ ...f, fromLocation: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    value={form.toLocation}
                    onChange={(e) => setForm((f) => ({ ...f, toLocation: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reward (credits)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rewardCredits}
                  onChange={(e) => setForm((f) => ({ ...f, rewardCredits: +e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Browse open</TabsTrigger>
          <TabsTrigger value="my">My requests</TabsTrigger>
        </TabsList>
        <TabsContent value="browse" className="mt-4">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground">No open requests. Create one!</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => (
                <RequestCard
                  key={r._id}
                  request={r}
                  onClaim={handleClaim}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="my" className="mt-4">
          {myList.length === 0 ? (
            <p className="text-muted-foreground">You have no requests.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myList.map((r) => (
                <RequestCard
                  key={r._id}
                  request={r}
                  onClaim={handleClaim}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
