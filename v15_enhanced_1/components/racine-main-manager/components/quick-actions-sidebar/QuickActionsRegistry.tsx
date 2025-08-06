'use client'

import React, { useState } from 'react'
import { Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuickActionsRegistryProps {
  className?: string
}

export const QuickActionsRegistry: React.FC<QuickActionsRegistryProps> = ({ className }) => {
  const [registry] = useState<Record<string, any>>({})

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Registry System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span>{Object.keys(registry).length} components</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuickActionsRegistry
