import { Service } from '@/types/service';
import { ServiceCard } from './ServiceCard';

interface ServiceGridProps {
  services: Service[];
  isLoading?: boolean;
}

export const ServiceGrid = ({ services, isLoading }: ServiceGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-card rounded-lg h-80 border border-border"
          />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Nessun servizio trovato</h3>
        <p className="text-muted-foreground">Prova a modificare i filtri di ricerca</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
};