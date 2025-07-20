import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ClassificationResults: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classification Results</h1>
          <p className="text-muted-foreground">
            View and manage classification results and applied labels
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
            The Classification Results component is currently under development. 
            This will include result viewing, filtering, approval workflows, and bulk actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationResults;