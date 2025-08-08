import React, { useEffect, useState } from 'react';
import { usePipelineManager } from '../../hooks';
import { pipelineManagementAPI, aiAssistantAPI, racineOrchestrationAPI } from '../../services';
import { PIPELINE_TEMPLATES } from '../../constants';
import { cn } from '@/lib/utils';

export default function PipelineDesigner() {
  const {
    state,
    actions,
    selectedStage,
    design,
    loadPipeline,
    savePipeline,
    executePipeline,
    optimizePipeline
  } = usePipelineManager();

  const [working, setWorking] = useState<'save' | 'exec' | 'opt' | null>(null);

  useEffect(() => {
    // prefetch optimization configs
    aiAssistantAPI.getOptimizationRecommendations?.({}).catch(() => {});
  }, []);

  return (
    <div className={cn('flex h-full w-full overflow-hidden')}>
      <div className="w-72 border-r bg-background/60 backdrop-blur">
        <div className="p-3 font-semibold">Stage Palette</div>
      </div>
      <div className="flex-1 relative">
        <div className="sticky top-0 z-10 flex items-center gap-2 p-2 border-b bg-background/80 backdrop-blur">
          <button className="btn" onClick={async()=>{setWorking('save'); try{await savePipeline();} finally{setWorking(null);}}} disabled={working!==null}>Save</button>
          <button className="btn" onClick={async()=>{setWorking('opt'); try{await optimizePipeline();} finally{setWorking(null);}}} disabled={working!==null}>Optimize</button>
          <button className="btn btn-primary" onClick={async()=>{setWorking('exec'); try{await executePipeline();} finally{setWorking(null);}}} disabled={working!==null}>Execute</button>
        </div>
        <div className="h-[calc(100%-48px)]">
          {/* Designer canvas (to be integrated fully) */}
        </div>
      </div>
      <div className="w-96 border-l bg-background/60 backdrop-blur">
        <div className="p-3 font-semibold">Inspector</div>
      </div>
    </div>
  );
}