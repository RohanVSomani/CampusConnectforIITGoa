import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Package,
  Users,
  AlertTriangle,
  ShoppingCart,
  Printer,
  Coins,
  Map,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import CreditBadge from '@/components/CreditBadge';
import { cn } from '@/lib/utils';

const studentNav = [
  { to: '/', label: 'Home', icon: LayoutDashboard },
  { to: '/travel', label: 'Travel', icon: Car },
  { to: '/requests', label: 'Requests', icon: Package },
  { to: '/carpool', label: 'Carpool', icon: Users },
  { to: '/emergency', label: 'Emergency', icon: AlertTriangle },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/xerox', label: 'Xerox', icon: Printer },
  { to: '/credits', label: 'Credits', icon: Coins },
  { to: '/map', label: 'Campus Map', icon: Map },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];



function NavLinks({ onLinkClick }) {
  const { user } = useAuth();

  const nav =
    user?.role === 'shop'
      ? [{ to: '/shop/orders', label: 'Print Orders', icon: Printer }]
      : studentNav;

  return (
    <>
      {nav.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onLinkClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </>
  );
}


export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'shop' && location.pathname === '/') {
      navigate('/shop/orders', { replace: true });
    }
  }, [user, location.pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card md:block">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <span className="text-lg font-bold text-primary">CampusFlow</span>
        </div>

        <nav className="flex flex-col gap-1 p-2">
          <NavLinks />
          {user?.role === 'admin' && (
            <>
              <Separator className="my-2" />
              <NavLink to="/admin" className="nav">
                <Settings className="h-4 w-4" /> Admin
              </NavLink>
            </>
          )}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="mb-2 flex items-center justify-between">
            <CreditBadge credits={user?.credits ?? 0} />
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </Button>
          </div>
          <div className="mb-2 truncate text-sm">{user?.email}</div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:pl-64">
        <div className="min-h-screen p-4 pt-14 md:pt-6 md:pl-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
