import { useState, useEffect } from 'react';
import { Service, SearchFilters } from '@/types/service';
import { apiService } from '@/services/api';
import { mockServices } from '@/data/mockServices';

export const useServices = (searchQuery: string = '', filters: SearchFilters = {}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [searchQuery, filters]);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const response = await apiService.getServices(searchQuery, filters);
      
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('API fetch failed, using mock data:', error);
      
      // Fallback to mock data with client-side filtering
      let filteredServices = [...mockServices];

      // Apply search query
      if (searchQuery.trim()) {
        filteredServices = filteredServices.filter(service =>
          service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply filters
      if (filters.category) {
        filteredServices = filteredServices.filter(service =>
          service.category.toLowerCase() === filters.category?.toLowerCase()
        );
      }

      if (filters.minPrice !== undefined) {
        filteredServices = filteredServices.filter(service =>
          service.price >= filters.minPrice!
        );
      }

      if (filters.maxPrice !== undefined) {
        filteredServices = filteredServices.filter(service =>
          service.price <= filters.maxPrice!
        );
      }

      if (filters.rating !== undefined) {
        filteredServices = filteredServices.filter(service =>
          service.rating >= filters.rating!
        );
      }

      setServices(filteredServices);
      setError('Using offline data - connect to API for real-time results');
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