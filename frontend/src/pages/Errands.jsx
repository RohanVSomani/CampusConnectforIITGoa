

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

export default function Errands() {
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
      setForm({
        title: '',
        description: '',
        type: 'errand',
        fromLocation: '',
        toLocation: '',
        rewardCredits: 0,
      });
      fetchList();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleClaim(id) {
    try {
      await api.post(`/errands/${id}/claim`);
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
        ? 'Cancel this request?'
        : 'Remove helper and reopen request?';

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Errands & Items</h1>
          <p className="text-muted-foreground">
            Request or fulfill item pickups and errands
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New errand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create errand</DialogTitle>
              <DialogDescription>
                Request an item or errand.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />

              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From</Label>
                  <Input
                    value={form.fromLocation}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fromLocation: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label>To</Label>
                  <Input
                    value={form.toLocation}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        toLocation: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Label>Reward (credits)</Label>
              <Input
                type="number"
                min={0}
                value={form.rewardCredits}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    rewardCredits: +e.target.value,
                  }))
                }
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
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
          <TabsTrigger value="my">My errands</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <RequestCard
                key={e._id}
                request={e}
                onClaim={() => handleClaim(e._id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myList.map((e) => (
              <RequestCard
                key={e._id}
                request={e}
                onComplete={handleComplete}
                onCancel={handleCancel}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
