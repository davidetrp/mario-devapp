import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Sidebar } from '@/components/layout/Sidebar';
import { SearchBar } from '@/components/home/SearchBar';
import { ServiceGrid } from '@/components/home/ServiceGrid';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { DatabaseConnectionError } from '@/components/errors/DatabaseConnectionError';
import { useServices } from '@/hooks/useServices';
import { SearchFilters } from '@/types/service';

const Index = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const { services, isLoading: servicesLoading, error, refetch } = useServices(searchQuery, filters);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterToggle = () => {
    // TODO: Implement filter panel
    console.log('Filter toggle clicked');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  // Show database connection error if no services and error exists
  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  // Show database connection error if we can't fetch services
  if (error && services.length === 0 && !servicesLoading) {
    return <DatabaseConnectionError onRetry={refetch} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'settings':
        return <SettingsPanel />;
      case 'profile':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Profile</h2>
            <p className="text-muted-foreground">Profile page coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Find the perfect service
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover talented freelancers ready to help bring your ideas to life
              </p>
            </div>
            <SearchBar onSearch={handleSearch} onFilterToggle={handleFilterToggle} />
            {error && (
              <div className="text-center p-4 bg-muted/20 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            )}
            <ServiceGrid services={services} isLoading={servicesLoading} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="bg-card/80 backdrop-blur-sm border-border"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Main content */}
      <div className="lg:ml-80 min-h-screen">
        <main className="p-6 lg:p-8">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
