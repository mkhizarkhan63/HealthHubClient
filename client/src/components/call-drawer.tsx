import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Calendar, AlertTriangle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatTime, highlightKeywords } from "@/lib/utils";
import type { CallDto } from "@/types/api";

interface CallDrawerProps {
  call: CallDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CallDrawer({ call, isOpen, onClose }: CallDrawerProps) {
  const queryClient = useQueryClient();

  const escalateMutation = useMutation({
    mutationFn: async (callId: number) => {
      const response = await apiRequest("POST", `/api/calls/${callId}/escalate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      onClose();
    },
  });

  const handleEscalate = () => {
    if (call) {
      escalateMutation.mutate(call.id);
    }
  };

  if (!call) return null;

  const formatDateTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return `Today, ${formatTime(date)}`;
    }
    
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[40%] min-w-[500px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="flex flex-row items-center justify-between p-6 border-b">
            <div>
              <SheetTitle className="text-lg font-semibold">
                {call.patientName}
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDateTime(call.timestamp)}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{call.phoneNumber}</p>
                  </div>
                  {call.dob && (
                    <div>
                      <span className="text-muted-foreground">DOB:</span>
                      <p className="font-medium">
                        {(() => {
                          const date = new Date(call.dob);
                          return isNaN(date.getTime()) ? call.dob : date.toLocaleDateString('en-AU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                        })()}
                      </p>
                    </div>
                  )}
                  {call.appointmentType && (
                    <div>
                      <span className="text-muted-foreground">Appointment Type:</span>
                      <p className="font-medium">{call.appointmentType}</p>
                    </div>
                  )}
                  {call.doctor && (
                    <div>
                      <span className="text-muted-foreground">Doctor:</span>
                      <p className="font-medium">{call.doctor.startsWith('Dr.') ? call.doctor : `Dr. ${call.doctor}`}</p>
                    </div>
                  )}
                  {call.appointmentDateTime && (
                    <div>
                      <span className="text-muted-foreground">Scheduled:</span>
                      <p className="font-medium">
                        {new Date(call.appointmentDateTime).toLocaleDateString('en-AU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Section */}
              <div className="bg-muted rounded-lg p-4">
                <Accordion type="single" defaultValue="transcript" collapsible>
                  <AccordionItem value="transcript" className="border-none">
                    <AccordionTrigger className="text-sm font-medium hover:no-underline">
                      Call Transcript
                    </AccordionTrigger>
                    <AccordionContent className="mt-4 space-y-3">
                      {call.transcript && call.transcript.length > 0 ? (
                        call.transcript.map((entry, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded whitespace-nowrap">
                              {entry.timestamp}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className={`text-xs font-medium ${
                                entry.speaker === 'AI Assistant' ? 'text-primary' : 'text-foreground'
                              }`}>
                                {entry.speaker}:
                              </span>
                              <p 
                                className="text-sm text-foreground mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: highlightKeywords(entry.message, entry.keywords)
                                }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No transcript available for this call.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* AI Decision Log */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">AI Decision Log</h4>
                <div className="space-y-2">
                  {call.aiDecisions && call.aiDecisions.length > 0 ? (
                    call.aiDecisions.map((decision, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {decision}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No AI decisions recorded for this call.
                    </p>
                  )}
                </div>
              </div>


            </div>
          </ScrollArea>


        </div>
      </SheetContent>
    </Sheet>
  );
}
