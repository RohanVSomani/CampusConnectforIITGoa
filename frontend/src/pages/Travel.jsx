

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TravelCard from '@/components/TravelCard';

export default function Travel() {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [myList, setMyList] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    type: 'request',
    from: '',
    to: '',
    departureAt: '',
    seats: 1,
    notes: '',
  });

  async function fetchAll() {
    try {
      const [res, my, matchesRes] = await Promise.all([
        api.get('/travel?status=open'),
        api.get('/travel/my'),
        api.get('/travel/matches'),
      ]);
      setList(res.data || []);
      setMyList(my.data || []);
      setMatches(matchesRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/travel', {
        ...form,
        departureAt: new Date(form.departureAt).toISOString(),
      });
      setOpen(false);
      setForm({ type: 'request', from: '', to: '', departureAt: '', seats: 1, notes: '' });
      fetchAll();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleCancel(t) {
    try {
      await api.patch(`/travel/${t._id}`, { status: 'cancelled' });
      fetchAll();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between m-1">
        <div>
          <h1 className="text-2xl font-bold">Travel & Commute</h1>
          <p className="text-muted-foreground">Match ride requests and offers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New request / offer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add travel</DialogTitle>
              <DialogDescription>Create a ride request or offer.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="request">Request</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input value={form.from} onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Departure</Label>
                <Input
                  type="datetime-local"
                  value={form.departureAt}
                  onChange={(e) => setForm((f) => ({ ...f, departureAt: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Seats</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.seats}
                  onChange={(e) => setForm((f) => ({ ...f, seats: +e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
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
          <TabsTrigger value="my">My posts</TabsTrigger>
          <TabsTrigger value="matches">My matches</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4">
          {loading ? (
            <p>Loading...</p>
          ) : list.length === 0 ? (
            <p>No open travel posts.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <TravelCard key={t._id} travel={t} showActions={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          {myList.length === 0 ? (
            <p>You have no travel posts.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myList.map((t) => (
                <TravelCard
                  key={t._id}
                  travel={t}
                  onCancel={handleCancel}
                  showActions={t.status === 'open'}
                />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="matches" className="mt-4">
          {matches.length === 0 ? (
            <p>No matches yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((m) => {
                const meIsA = m.travelA.userId._id === m.travelB.userId._id ? false : true;
                const other = meIsA ? m.travelB.userId : m.travelA.userId;

                return (
                  <div key={m._id} className="border rounded-lg p-4 space-y-2">
                    <p className="font-semibold">
                      {m.travelA.from} → {m.travelA.to}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Matched with {other?.name}
                    </p>
                    <Button onClick={() => navigate(`/chat/${m._id}`)}>
                      Open Chat
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
