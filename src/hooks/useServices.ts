import { useState, useEffect } from 'react';
import { Service, SearchFilters } from '@/types/service';
import { apiService } from '@/services/api';

export const useServices = (searchQuery: string = '', filters: SearchFilters = {}, enabled: boolean = true) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (enabled) {
      fetchServices();
    }
  }, [searchQuery, filters, enabled]);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch from API - no fallback to mock data
      const response = await apiService.getServices(searchQuery, filters);
      
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Failed to fetch services from API:', error);
      setError('Unable to connect to the database. Please ensure your backend is running.');
      setServices([]); // No fallback data
    } finally {
      setIsLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const response = await apiService.createService(serviceData);
      
      if (response.success && response.data) {
        setServices(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || 'Failed to create service');
      }
    } catch (error) {
      console.error('Create service failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const response = await apiService.updateService(id, serviceData);
      
      if (response.success && response.data) {
        setServices(prev => prev.map(service => 
          service.id === id ? { ...service, ...response.data } : service
        ));
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || 'Failed to update service');
      }
    } catch (error) {
      console.error('Update service failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const deleteService = async (id: string) => {
    try {
      const response = await apiService.deleteService(id);
      
      if (response.success) {
        setServices(prev => prev.filter(service => service.id !== id));
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Delete service failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    services,
    isLoading,
    error,
    refetch: fetchServices,
    createService,
    updateService,
    deleteService,
  };
};