import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Phone, Globe, Clock, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ServiceCard } from '@/components/home/ServiceCard';
import { apiService } from '@/services/api';
import { Service } from '@/types/service';

interface SellerProfile {
  id: number;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  years_experience: number;
  member_since: string;
  stats: {
    avg_rating: number;
    total_services: number;
    total_reviews: number;
  };
  services: Service[];
}

const SellerProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        const response = await apiService.getSeller(username);
        
        if (response.success && response.data) {
          const data = response.data as any;
          const normalizedServices = (data?.services || []).map((svc: any) => ({
            ...svc,
            seller: {
              username: data.username,
              avatar: data.avatar,
              rating: typeof svc.rating === 'number' ? svc.rating : (data?.stats?.avg_rating ?? 0),
            },
            reviews: typeof svc.reviews === 'number' ? svc.reviews : (svc.reviews_count ?? 0),
          }));

          setSeller({ ...data, services: normalizedServices });
        } else {
          setError('Artigiano non trovato');
        }
      } catch (err) {
        setError('Errore nel caricamento del profilo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [username]);

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
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Artigiano non trovato</h2>
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

        {/* Seller Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-32 w-32 mx-auto md:mx-0">
                <AvatarImage src={seller.avatar} alt={seller.name} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">{seller.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">@{seller.username}</p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {seller.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {seller.years_experience} anni di esperienza
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membro dal {new Date(seller.member_since).toLocaleDateString('it-IT')}
                  </div>
                </div>

                <p className="text-muted-foreground mb-6 max-w-2xl">{seller.bio}</p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  {seller.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {seller.phone}
                    </div>
                  )}
                  {seller.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={`https://${seller.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        {seller.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">{seller.stats.total_services}</div>
                  <div className="text-sm text-muted-foreground">Servizi</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {renderStars(seller.stats.avg_rating)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {seller.stats.avg_rating.toFixed(1)} media
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">{seller.stats.total_reviews}</div>
                  <div className="text-sm text-muted-foreground">Recensioni</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Servizi di {seller.name} ({seller.services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {seller.services.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nessun servizio disponibile al momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seller.services.map((service) => (
                  <div key={service.id} onClick={() => navigate(`/service/${service.id}`)}>
                    <ServiceCard service={service} />
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

export default SellerProfile;
