import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Check, AlertCircle } from "lucide-react";
import { formatTime, formatPhoneNumber, truncateText } from "@/lib/utils";
import type { CallDto } from "@/types/api";

interface CallTableProps {
  calls: CallDto[];
  isLoading: boolean;
  onViewTranscript: (callId: number) => void;
}

export default function CallTable({ calls, isLoading, onViewTranscript }: CallTableProps) {

  const getOutcomeVariant = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'booked':
        return 'status-booked';
      case 'transferred':
        return 'status-transferred';
      default:
        return 'status-no-action';
    }
  };

  const getVerificationVariant = (isVerified: boolean) => {
    return isVerified ? 'verification-verified' : 'verification-unverified';
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Time</TableHead>
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Patient</TableHead>
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden lg:table-cell">Appointment</TableHead>
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Outcome</TableHead>
              <TableHead className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">Transcript</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 sm:py-8 px-4">
                  <div className="text-sm sm:text-base text-muted-foreground">
                    No calls found. Calls will appear here when they are received from ElevenLabs.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              calls.map((call) => (
                <TableRow key={call.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {formatTime(call.timestamp)}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(call.timestamp).toLocaleDateString('en-AU', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {call.patientName}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatPhoneNumber(call.phoneNumber)}
                      </span>
                      <Badge 
                        className={`w-fit text-xs ${getVerificationVariant(call.isVerified)}`}
                      >
                        {call.isVerified ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Verified</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Unverified</span>
                            <span className="sm:hidden">!</span>
                          </>
                        )}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-foreground">
                        {call.appointmentType || "Unknown Type"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {truncateText(call.reason, 35)}
                      </span>
                      {call.doctor && (
                        <span className="text-xs text-blue-600 font-medium">
                          {call.doctor.startsWith('Dr.') ? call.doctor : `Dr. ${call.doctor}`}
                        </span>
                      )}
                      {call.appointmentDateTime && (
                        <span className="text-xs text-primary">
                          {new Date(call.appointmentDateTime).toLocaleDateString('en-AU', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                    <Badge className={`status-pill text-xs ${getOutcomeVariant(call.outcome)}`}>
                      {call.outcome}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 sm:px-6 py-3 sm:py-4">
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary/80 p-0 h-auto font-medium text-xs sm:text-sm"
                      onClick={() => onViewTranscript(call.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
