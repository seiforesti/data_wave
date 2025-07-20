import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ClassificationSettings: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classification Settings</h1>
          <p className="text-muted-foreground">
            Configure global classification settings and data source preferences
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Construction className="h-5 w-5 mr-2" />
            Under Development
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The Classification Settings component is currently under development. 
            This will include data source settings, notification preferences, and system configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationSettings;