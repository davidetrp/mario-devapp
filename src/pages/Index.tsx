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
import { mockServices } from '@/data/mockServices';
import { Service } from '@/types/service';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Filter services based on search query
    if (searchQuery.trim()) {
      const filtered = mockServices.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setServices(filtered);
    } else {
      setServices(mockServices);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
    );
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
            <SearchBar onSearch={handleSearch} onFilterToggle={() => {}} />
            <ServiceGrid services={services} />
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
