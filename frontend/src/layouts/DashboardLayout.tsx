import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BarChart3, BrainCircuit, Database, FileText, Settings, LogOut, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function DashboardLayout() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: BarChart3 },
    { name: 'Datasets', href: '/dashboard/datasets', icon: Database },
    { name: 'AutoML', href: '/dashboard/automl', icon: BrainCircuit },
    { name: 'Predict', href: '/dashboard/predict', icon: Activity },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 glass border-r border-border/50 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <BrainCircuit className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">DecisionMind</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-textMuted hover:bg-surfaceHover hover:text-text transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border/50">
          <Button variant="ghost" className="w-full justify-start text-textMuted hover:text-red-400" onClick={logout}>
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 glass border-b border-border/50 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm">
              U
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8 bg-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
