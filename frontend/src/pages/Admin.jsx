

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, u, a] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/activity'),
        ]);
        setStats(s.data);
        setUsers(u.data || []);
        setActivity(a.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-muted-foreground">Analytics & platform stats</p>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardDescription>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </CardDescription>
                <CardTitle className="text-2xl">{value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4">
          <div className="space-y-2">
            {users.map((u) => (
              <Card key={u._id}>
                <CardContent className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-sm text-muted-foreground">{u.email}</span>
                  <span className="text-xs rounded bg-muted px-2 py-0.5">{u.role}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          {activity && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Travel</CardTitle>
                  <CardDescription>Recent</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {(activity.travel || []).slice(0, 5).map((t) => (
                      <li key={t._id}>{t.from} → {t.to}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Errands</CardTitle>
                  <CardDescription>Recent</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {(activity.errands || []).slice(0, 5).map((e) => (
                      <li key={e._id}>{e.title}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
