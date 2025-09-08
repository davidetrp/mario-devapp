import { Service } from '@/types/service';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/service/${service.id}`);
  };
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-card hover:-translate-y-1 bg-gradient-card border-border" onClick={handleClick}>
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight">
            {service.title}
          </h3>
          <Badge variant="secondary" className="ml-2 bg-secondary/50">
            {service.category}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {service.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={service.seller.avatar} alt={service.seller.username} />
              <AvatarFallback className="text-xs">
                {service.seller.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {service.seller.username}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{service.rating}</span>
            <span className="text-xs text-muted-foreground">({service.reviews})</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Starting at</span>
            <span className="text-lg font-bold text-primary">${service.price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};