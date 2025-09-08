import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { apiService } from '@/services/api';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews_count: number;
  created_at: string;
  gallery: Array<{
    url: string;
    caption?: string;
    order: number;
  }>;
  seller: {
    id: number;
    username: string;
    name: string;
    avatar: string;
    bio: string;
    location: string;
    phone: string;
    website: string;
    years_experience: number;
    rating: number;
  };
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
      username: string;
      name: string;
      avatar: string;
    };
  }>;
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await apiService.getService(id);
        if (response.success) {
          setService(response.data);
        } else {
          setError('Servizio non trovato');
        }
      } catch (err) {
        setError('Errore nel caricamento del servizio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleSellerClick = () => {
    if (service?.seller.username) {
      navigate(`/seller/${service.seller.username}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'fill-primary text-primary' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Servizio non trovato</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna ai servizi
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </CarouselItem>
                {service.gallery.map((image, index) => (
                  <CarouselItem key={index}>
                    <img
                      src={image.url}
                      alt={image.caption || `Gallery image ${index + 1}`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {service.gallery.length > 0 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>

          {/* Service Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{service.category}</Badge>
                <div className="flex items-center gap-1">
                  {renderStars(service.rating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({service.reviews_count} recensioni)
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">{service.title}</h1>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>

            <div className="text-3xl font-bold text-primary">€{service.price.toFixed(2)}</div>

            <Button size="lg" className="w-full">
              Contatta per preventivo
            </Button>
          </div>
        </div>

        {/* Seller Info */}
        <Card className="mb-12 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleSellerClick}>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={service.seller.avatar} alt={service.seller.name} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{service.seller.name}</h3>
                <p className="text-muted-foreground">@{service.seller.username}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {service.seller.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.seller.years_experience} anni di esperienza
                  </div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{service.seller.bio}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {service.seller.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {service.seller.phone}
                </div>
              )}
              {service.seller.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <a href={`https://${service.seller.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {service.seller.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recensioni ({service.reviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {service.reviews.length === 0 ? (
              <p className="text-muted-foreground">Nessuna recensione ancora disponibile.</p>
            ) : (
              <div className="space-y-6">
                {service.reviews.map((review, index) => (
                  <div key={review.id}>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} alt={review.user.name} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.user.name}</span>
                          <span className="text-sm text-muted-foreground">@{review.user.username}</span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-2">{review.comment}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                    </div>
                    {index < service.reviews.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceDetail;