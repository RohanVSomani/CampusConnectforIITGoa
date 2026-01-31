

import { Link } from 'react-router-dom';
import {
  Car,
  Package,
  Users,
  ShoppingCart,
  Printer,
  Coins,
  Map,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreditBadge from '@/components/CreditBadge';
import EmergencyButton from '@/components/EmergencyButton';

const modules = [
  { to: '/travel', label: 'Travel', icon: Car, desc: 'Match rides & commutes' },
  { to: '/requests', label: 'Requests', icon: Package, desc: 'Items & errands' },
  { to: '/carpool', label: 'Carpool', icon: Users, desc: 'Coordinate rides' },
  { to: '/orders', label: 'Orders', icon: ShoppingCart, desc: 'Group ordering' },
  { to: '/xerox', label: 'Xerox', icon: Printer, desc: 'Campus printing' },
  { to: '/credits', label: 'Credits', icon: Coins, desc: 'Campus credits' },
  { to: '/map', label: 'Campus Map', icon: Map, desc: 'Map & heatmap' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Welcome, {user?.name ?? 'User'}</h1>
          <p className="text-muted-foreground mt-1">CampusFlow AI – your smart campus hub.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CreditBadge credits={user?.credits ?? 0} />
          <EmergencyButton asLink />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/credits">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardDescription>Credits</CardDescription>
              <CardTitle className="text-2xl">{user?.credits ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/travel">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardDescription>Travel</CardDescription>
              <CardTitle className="text-lg">Rides & commutes</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/requests">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardDescription>Requests</CardDescription>
              <CardTitle className="text-lg">Errands & items</CardTitle>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/map">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <CardDescription>Campus Map</CardDescription>
              <CardTitle className="text-lg">Live heatmap</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="text-sm">{desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                    Open <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
