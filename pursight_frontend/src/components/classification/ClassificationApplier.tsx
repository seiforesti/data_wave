import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ClassificationApplier: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apply Classifications</h1>
          <p className="text-muted-foreground">
            Apply classification rules to data sources, scan results, and catalog items
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
            The Classification Applier component is currently under development. 
            This will include rule application workflows, target selection, and background processing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationApplier;