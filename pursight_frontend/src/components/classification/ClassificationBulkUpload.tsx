import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ClassificationBulkUpload: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Upload classification rules, dictionaries, and frameworks in bulk
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
            The Bulk Upload component is currently under development. 
            This will include CSV/JSON/Excel upload capabilities, template downloads, and validation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassificationBulkUpload;