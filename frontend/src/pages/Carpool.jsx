

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCarpoolSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import CarpoolChat from './CarpoolChat';
import { useAuth } from '@/context/AuthContext';

export default function Carpool() {
  const { socket, connected } = useCarpoolSocket();
  const { user } = useAuth();

  const [list, setList] = useState([]);
  const [my, setMy] = useState({ asDriver: [], asPassenger: [] });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const [form, setForm] = useState({
    from: '',
    to: '',
    departureAt: '',
    maxSeats: 4,
    pricePerSeat: 0,
    notes: '',
  });

  async function fetchList() {
    try {
      const [res, myRes] = await Promise.all([
        api.get('/carpool?status=open'),
        api.get('/carpool/my'),
      ]);
      setList(res.data || []);
      setMy(myRes.data || { asDriver: [], asPassenger: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);
  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('updated', (carpool) => {
      setList((prev) =>
        prev.map((c) => (c._id === carpool._id ? carpool : c))
      );

      setMy((prev) => ({
        asDriver: prev.asDriver.map((c) => (c._id === carpool._id ? carpool : c)),
        asPassenger: prev.asPassenger.map((c) =>
          c._id === carpool._id ? carpool : c
        ),
      }));
    });

    return () => socket.off('updated');
  }, [socket, connected]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/carpool', {
        ...form,
        departureAt: new Date(form.departureAt).toISOString(),
      });
      setOpen(false);
      fetchList();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleJoin(id) {
    try {
      socket.emit('join:carpool', id);
      await api.post(`/carpool/${id}/join`);
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleLeave(id) {
    try {
      socket.emit('leave:carpool', id);
      await api.post(`/carpool/${id}/leave`);
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  async function handleEnd(id) {
    if (!confirm('End this carpool? This cannot be undone.')) return;
    try {
      await api.patch(`/carpool/${id}/end`);
      fetchList();
    } catch (err) {
      alert(err.data?.message || err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carpool</h1>
          <p className="text-muted-foreground">Coordinate rides and join carpools</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create carpool</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create carpool</DialogTitle>
              <DialogDescription>Offer a ride.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From</Label>
                  <Input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required />
                </div>
                <div>
                  <Label>To</Label>
                  <Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required />
                </div>
              </div>
              <Label>Departure</Label>
              <Input type="datetime-local" value={form.departureAt} onChange={(e) => setForm({ ...form, departureAt: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max seats</Label>
                  <Input type="number" min={1} value={form.maxSeats} onChange={(e) => setForm({ ...form, maxSeats: +e.target.value })} />
                </div>
                <div>
                  <Label>Price per seat</Label>
                  <Input type="number" min={0} value={form.pricePerSeat} onChange={(e) => setForm({ ...form, pricePerSeat: +e.target.value })} />
                </div>
              </div>
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse">Open carpools</TabsTrigger>
          <TabsTrigger value="my">My carpools</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <Card key={c._id}>
                <CardHeader>
                  <CardTitle className="font-semibold">{c.from} → {c.to}</CardTitle>
                  <CardDescription>
                    {new Date(c.departureAt).toLocaleString()} · {c.seatsTaken}/{c.maxSeats}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button size="sm" onClick={() => handleJoin(c._id)}>Join</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[...my.asDriver, ...my.asPassenger].map((c) => {
              const isLeader = c.driverId === user?._id;

              return (
                <Card key={c._id}>
                  <CardHeader>
                    <Badge>{c.status}</Badge>
                    <CardTitle className="font-semibold pt-3">{c.from} → {c.to}</CardTitle>
                    <CardDescription>{c.seatsTaken}/{c.maxSeats}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                  {!['completed', 'cancelled'].includes(c.status) && (
  <Button size="sm" onClick={() => setActiveChat(c)}>
    Open Chat
  </Button>
)}

                    {c.status === 'open' && my.asPassenger.some(p => p._id === c._id) && (
                      <Button size="sm" variant="outline" onClick={() => handleLeave(c._id)}>Leave</Button>
                    )}
                    {c.status === 'open' && isLeader && (
                      <Button size="sm" variant="destructive" onClick={() => handleEnd(c._id)}>
                        End Carpool
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {activeChat && <CarpoolChat carpool={activeChat} onClose={() => setActiveChat(null)} />}
    </div>
  );
}
