import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useWorkflow } from '@/context/WorkflowContext';
import { MessageSquare, Send, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';

export const FactoryCommunication = () => {
  const { workflowData, updateWorkflowData } = useWorkflow();
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: 'designer' as const,
      message: newMessage,
      timestamp: new Date(),
    };

    updateWorkflowData({
      factoryMessages: [...workflowData.factoryMessages, message],
    });
    setNewMessage('');
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Factory Communication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Factory Info */}
        {workflowData.selectedFactory && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{workflowData.selectedFactory.name}</p>
                <p className="text-xs text-muted-foreground">{workflowData.selectedFactory.location}</p>
              </div>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {workflowData.factoryMessages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No messages yet. Start a conversation with your factory.
            </p>
          ) : (
            workflowData.factoryMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-lg ${
                  msg.sender === 'designer'
                    ? 'bg-primary/10 ml-8'
                    : 'bg-muted mr-8'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {msg.sender === 'designer' ? 'You' : workflowData.selectedFactory?.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm">{msg.message}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {msg.attachments.map((att, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs gap-1">
                        <FileText className="w-3 h-3" />
                        Attachment
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-2">
              <Paperclip className="w-4 h-4" />
              Attach
            </Button>
            <Button onClick={handleSendMessage} size="sm" className="gap-2">
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
