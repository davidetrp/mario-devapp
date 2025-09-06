import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
}

export const SearchBar = ({ onSearch, onFilterToggle }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Cerca servizi artigianali..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onFilterToggle}
          className="h-12 w-12 border-border hover:bg-secondary"
        >
          <Filter className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          className="h-12 px-6 bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          Search
        </Button>
      </form>
    </div>
  );
};