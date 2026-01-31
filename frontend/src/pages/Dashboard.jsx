import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Users,
  Car,
  Package,
  UsersRound,
  AlertTriangle,
  ShoppingCart,
  Printer,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CreditBadge from '@/components/CreditBadge';

const statIcons = {
  usersTotal: Users,
  travelOpen: Car,
  errandsOpen: Package,
  carpoolsOpen: UsersRound,
  sosActive: AlertTriangle,
  ordersPlaced: ShoppingCart,
  printJobsToday: Printer,
};

const endpoints = {
  travel: '/travel',
  errands: '/errands',
  carpools: '/carpool',
  sos: '/sos',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: null })),
          api.get('/admin/activity').catch(() => ({ data: null })),
        ]);
        setStats(statsRes?.data ?? null);
        setActivity(activityRes?.data ?? null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAdmin = user?.role === 'admin';

  async function openModal(type, title) {
    try {
      const res = await api.get(endpoints[type]);
      setModalData(res.data || []);
      setModalTitle(title);
      setOpen(true);
    } catch (err) {
      alert('Failed to load data');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview & analytics</p>
        </div>
        <CreditBadge credits={user?.credits ?? 0} />
      </div>

      {isAdmin && stats && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Platform stats</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats).map(([key, value]) => {
              const Icon = statIcons[key];
              const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (s) => s.toUpperCase())
                .trim();
              return (
                <Card key={key}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardDescription>{label}</CardDescription>
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl">{value}</CardTitle>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {isAdmin && activity && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: 'travel', title: 'Travel' },
              { key: 'errands', title: 'Errands' },
              { key: 'carpools', title: 'Carpools' },
              { key: 'sos', title: 'SOS' },
            ].map(({ key, title }) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>Latest records</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {(activity[key] || []).slice(0, 5).map((i) => (
                      <li key={i._id} className="truncate text-muted-foreground">
                        {i.title || `${i.from || ''} → ${i.to || ''}` || i.status}
                      </li>
                    ))}
                    {(activity[key] || []).length === 0 && (
                      <li className="text-muted-foreground">None</li>
                    )}
                  </ul>
                  <Button
                    variant="link"
                    className="mt-2 p-0 h-auto"
                    onClick={() => openModal(key, title)}
                  >
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading…</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle} — Full List</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {modalData.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-4 bg-card hover:shadow transition"
              >
                {modalTitle === 'Travel' && (
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {item.from} → {item.to}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Date: {new Date(item.date || item.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      Seats: {item.seatsAvailable ?? item.seats ?? 'N/A'}
                    </div>
                  </div>
                )}

                {modalTitle === 'Errands' && (
                  <div className="space-y-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description || 'No description'}
                    </div>
                    <div className="text-sm">
                      Reward: <b>{item.bonusCredits || 0}</b> credits
                    </div>
                    <div className="text-sm">Status: {item.status}</div>
                  </div>
                )}

                {modalTitle === 'Carpools' && (
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {item.from} → {item.to}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Time: {new Date(item.time || item.createdAt).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      Seats Available:{' '}
                      {item.seatsAvailable ?? item.availableSeats ?? 'N/A'}
                    </div>
                    <div className="text-sm">Status: {item.status}</div>
                  </div>
                )}

                {/* SOS */}
                {modalTitle === 'SOS' && (
                  <div className="space-y-1">
                    <div className="font-semibold text-destructive">
                      {item.status.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.message || 'No message'}
                    </div>
                    <div className="text-sm">
                      Time: {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {item.location?.coordinates && (
                      <div className="text-sm">
                        Location:{' '}
                        {item.location.coordinates[1].toFixed(4)},{' '}
                        {item.location.coordinates[0].toFixed(4)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {modalData.length === 0 && (
              <p className="text-muted-foreground">No records found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
