/**
 * Credits – campus credits, history, leaderboard
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreditBadge from '@/components/CreditBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Credits() {
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const [balRes, histRes, leadRes] = await Promise.all([
        api.get('/credits/balance'),
        api.get('/credits/history'),
        api.get('/credits/leaderboard'),
      ]);
      setBalance(balRes);
      setHistory(histRes.data || []);
      setLeaderboard(leadRes.data || []);
      refreshUser();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campus Credits</h1>
        <p className="text-muted-foreground">Earn, spend, leaderboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Balance</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CreditBadge credits={balance?.credits ?? user?.credits ?? 0} linkTo={false} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Level</CardDescription>
            <CardTitle className="text-2xl">{balance?.level ?? 1}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Streak</CardDescription>
            <CardTitle className="text-2xl">{balance?.streak ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Badges</CardDescription>
            <CardTitle className="text-base">
              {(balance?.badges ?? []).length
                ? balance.badges.join(', ')
                : 'None yet'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-4">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <Card key={h._id}>
                  <CardContent className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <span className={h.amount >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                      {h.amount >= 0 ? '+' : ''}{h.amount}
                    </span>
                    <span className="text-sm text-muted-foreground">{h.reason}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-4">
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-muted-foreground">No entries yet.</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((u, i) => (
                <Card key={u._id}>
                  <CardContent className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">#{i + 1} {u.name}</span>
                    <CreditBadge credits={u.credits} linkTo={false} />
                    <span className="text-xs text-muted-foreground">
                      Lv{u.level ?? 1} · Streak {u.streak ?? 0}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
