import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Server } from 'lucide-react';

interface DatabaseConnectionErrorProps {
  onRetry: () => void;
}

export const DatabaseConnectionError = ({ onRetry }: DatabaseConnectionErrorProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <Card className="w-full max-w-md bg-gradient-card shadow-card border-border text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
            <Database className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Database Connection Error</CardTitle>
            <CardDescription>Unable to connect to the Mario backend</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Make sure your backend server is running on:</p>
            <code className="block bg-muted/20 p-2 rounded text-xs">
              http://localhost:3001
            </code>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Quick Setup:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Clone your GitHub repo locally</p>
              <p>2. Follow README-BACKEND.md setup guide</p>
              <p>3. Start your PostgreSQL database</p>
              <p>4. Run: <code className="bg-muted/20 px-1 rounded">npm run dev</code></p>
            </div>
          </div>

          <Button 
            onClick={onRetry}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Server className="h-3 w-3" />
              <span>Backend Required for Full Functionality</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};