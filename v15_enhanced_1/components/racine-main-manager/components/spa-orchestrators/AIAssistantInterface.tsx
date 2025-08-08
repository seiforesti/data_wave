import React, { useEffect, useRef, useState } from 'react';
import { useAIAssistant, useContextAwareAI, useWorkspaceManagement } from '../../hooks';
import { aiAssistantAPI, crossGroupIntegrationAPI, racineOrchestrationAPI } from '../../services';
import { cn } from '@/lib/utils';

export default function AIAssistantInterface() {
  const { state, actions, sendMessage } = useAIAssistant();
  const { context } = useContextAwareAI();
  const { currentWorkspace } = useWorkspaceManagement();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // preload context
    crossGroupIntegrationAPI.getIntegrationHealth().catch(() => {});
  }, []);

  const onSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await sendMessage(input);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn('flex h-full w-full')}> 
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {state.messages.map((m) => (
            <div key={m.id} className={cn('max-w-3xl', m.isFromUser ? 'ml-auto text-right' : '')}>
              <div className={cn('inline-block rounded-lg px-3 py-2', m.isFromUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex gap-2">
          <input className="input flex-1" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask the AI assistant..." />
          <button className="btn btn-primary" onClick={onSend} disabled={sending}>Send</button>
        </div>
      </div>
      <div className="w-[380px] border-l bg-background/60 backdrop-blur">
        <div className="p-3 font-semibold">Context</div>
        <div className="p-3 text-sm text-muted-foreground break-words">
          Workspace: {currentWorkspace?.name ?? '—'}
        </div>
      </div>
    </div>
  );
}