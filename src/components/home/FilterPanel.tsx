import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Star, Trash2, Navigation } from 'lucide-react';
import { SearchFilters } from '@/types/service';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const categories = [
  'Falegnameria',
  'Ceramica',
  'Gioielleria',
  'Tessitura',
  'Cuoio',
  'Ferro',
  'Vetro',
  'Pietra'
];

export const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange }: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [priceRange, setPriceRange] = useState([localFilters.minPrice || 0, localFilters.maxPrice || 1000]);
  const [distance, setDistance] = useState([localFilters.distance || 10]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([filters.minPrice || 0, filters.maxPrice || 1000]);
    setDistance([filters.distance || 10]);
  }, [filters]);

  const handleLocationNearMe = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newFilters = {
            ...localFilters,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: 'Vicino a me'
          };
          setLocalFilters(newFilters);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange);
    const newFilters = {
      ...localFilters,
      minPrice: newRange[0],
      maxPrice: newRange[1]
    };
    setLocalFilters(newFilters);
  };

  const handleDistanceChange = (newDistance: number[]) => {
    setDistance(newDistance);
    const newFilters = {
      ...localFilters,
      distance: newDistance[0]
    };
    setLocalFilters(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = {
      ...localFilters,
      rating: localFilters.rating === rating ? undefined : rating
    };
    setLocalFilters(newFilters);
  };

  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    
    if (key === 'location') {
      delete newFilters.latitude;
      delete newFilters.longitude;
      delete newFilters.distance;
      setDistance([10]);
    }
    
    if (key === 'minPrice' || key === 'maxPrice') {
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
      setPriceRange([0, 1000]);
    }
    
    setLocalFilters(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    setPriceRange([0, 1000]);
    setDistance([10]);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.location) count++;
    if (localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined) count++;
    if (localFilters.rating) count++;
    return count;
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`
        absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl
        transform transition-transform duration-300 ease-spring
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">Filtri</h3>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Filtri Attivi</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Rimuovi tutti
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localFilters.category && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.category}
                      <button
                        onClick={() => removeFilter('category')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {localFilters.location && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.location}
                      <button
                        onClick={() => removeFilter('location')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {(localFilters.minPrice !== undefined || localFilters.maxPrice !== undefined) && (
                    <Badge variant="secondary" className="text-xs">
                      €{priceRange[0]} - €{priceRange[1]}
                      <button
                        onClick={() => removeFilter('minPrice')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {localFilters.rating && (
                    <Badge variant="secondary" className="text-xs">
                      {localFilters.rating}+ stelle
                      <button
                        onClick={() => removeFilter('rating')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Categoria</Label>
              <Select 
                value={localFilters.category || ''} 
                onValueChange={(value) => setLocalFilters({ ...localFilters, category: value || undefined })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Località</Label>
              <div className="space-y-3">
                <Input
                  placeholder="Inserisci città o indirizzo"
                  value={localFilters.location || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value || undefined })}
                  className="bg-input border-border"
                />
                <Button
                  variant="outline"
                  onClick={handleLocationNearMe}
                  disabled={isGettingLocation}
                  className="w-full border-border hover:bg-secondary"
                >
                  <Navigation className={`h-4 w-4 mr-2 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  {isGettingLocation ? 'Rilevamento...' : 'Vicino a me'}
                </Button>
                
                {(localFilters.latitude && localFilters.longitude) && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Raggio di ricerca: {distance[0]} km
                    </Label>
                    <Slider
                      value={distance}
                      onValueChange={handleDistanceChange}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Prezzo</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>€{priceRange[0]}</span>
                  <span>€{priceRange[1]}</span>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Valutazione minima</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={localFilters.rating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRatingChange(rating)}
                    className="flex items-center gap-1 border-border"
                  >
                    <Star className={`h-3 w-3 ${
                      localFilters.rating === rating ? 'fill-current' : ''
                    }`} />
                    {rating}+
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex-1 border-border hover:bg-secondary"
              >
                Reset
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Applica Filtri
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};