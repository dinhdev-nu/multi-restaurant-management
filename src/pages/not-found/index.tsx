import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
        </div>

        <h2 className="text-2xl font-medium text-foreground mb-2">Page Not Found</h2>
        <p className="text-foreground/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
