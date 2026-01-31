import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useLocationSocket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin } from 'lucide-react';

export default function Emergency() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const { socket, connected } = useLocationSocket();
  async function getLiveLocation() {
    if (navigator.geolocation) {
      try {
        return await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve([p.coords.longitude, p.coords.latitude]),
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        });
      } catch (err) {
        console.warn("GPS failed, falling back to IP location");
      }
    }
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
  
    if (!data || !data.latitude || !data.longitude) {
      throw new Error("Unable to detect location");
    }
  
    return [data.longitude, data.latitude];
  }
  
  
  async function fetchList() {
    try {
      const res = await api.get('/sos');
      setList(res.data || []);
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
    if (!socket) return;
    socket.on('sos:new', (payload) => setList((prev) => [payload, ...prev]));
    socket.on('sos:updated', (payload) =>
      setList((prev) => prev.map((s) => (s._id === payload._id ? payload : s)))
    );
    return () => {
      socket.off('sos:new').off('sos:updated');
    };
  }, [socket]);

  async function handleSOS(e) {
    e.preventDefault();
    setSending(true);
    try {
      const [lng, lat] = await getLiveLocation();
  
      await api.post('/sos', {
        lng,
        lat,
        message: message || 'Emergency SOS',
      });
  
      setMessage('');
      fetchList();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Location unavailable');
    } finally {
      setSending(false);
    }
  }
  
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emergency SOS</h1>
        <p className="text-muted-foreground">Trigger SOS with live location. Realtime updates.</p>
      </div>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Send SOS
          </CardTitle>
          <CardDescription>
            Your location will be shared. Use only in real emergencies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSOS} className="space-y-3">
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <Button type="submit" variant="destructive" size="lg" disabled={sending} className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {sending ? 'Sending…' : 'Send SOS'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          My SOS history
          {connected && <Badge variant="secondary">Live</Badge>}
        </h2>
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground">No SOS events.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((s) => (
              <Card key={s._id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={s.status === 'active' ? 'destructive' : 'secondary'}>
                      {s.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <CardTitle className="text-base">{s.message || 'SOS'}</CardTitle>
                  {s.address && (
                    <CardDescription>{s.address}</CardDescription>
                  )}
                  {s.location?.coordinates && (
                    <CardDescription>
                      {s.location.coordinates[1].toFixed(4)}, {s.location.coordinates[0].toFixed(4)}
                    </CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
