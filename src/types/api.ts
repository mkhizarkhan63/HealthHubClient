// Types matching .NET backend DTOs

export interface TranscriptEntry {
  timestamp: string;
  speaker: 'AI Assistant' | 'Patient';
  message: string;
  keywords?: string[];
}

export interface CallDto {
  id: number;
  timestamp: string;
  patientName: string;
  phoneNumber: string;
  isVerified: boolean;
  reason: string;
  outcome: string;
  needsAttention: boolean;
  attentionReason?: string;
  transcript: TranscriptEntry[];
  aiDecisions: string[];
  status: string;
  appointmentType?: string;
  appointmentDateTime?: string;
  doctor?: string;
  dob?: string;
}

export interface CreateCallDto {
  timestamp: string;
  patientName: string;
  phoneNumber: string;
  isVerified: boolean;
  reason: string;
  outcome: string;
  needsAttention: boolean;
  attentionReason?: string;
  transcript: TranscriptEntry[];
  aiDecisions: string[];
  status?: string;
  appointmentType?: string;
  appointmentDateTime?: string;
  doctor?: string;
  dob?: string;
}

export interface UpdateCallDto {
  isVerified?: boolean;
  outcome?: string;
  needsAttention?: boolean;
  attentionReason?: string;
  status?: string;
  appointmentType?: string;
  appointmentDateTime?: string;
  doctor?: string;
}

export interface EscalateCallDto {
  attentionReason: string;
}

export interface KnowledgeBaseFile {
  fileId: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface AgentConfigDto {
  agentId: string;
  name: string;
  firstMessage: string;
  systemPrompt: string;
  language: string;
  phoneNumber: string;
  knowledgebaseFiles: KnowledgeBaseFile[];
}

export interface UpdateAgentConfigDto {
  firstMessage?: string;
  systemPrompt?: string;
  phoneNumber?: string;
}

export interface CreateKnowledgeBaseFileDto {
  name: string;
  content: string;
}

export interface UpdateKnowledgeBaseFileDto {
  content: string;
}

export interface KnowledgeBaseFileDto {
  fileId: string;
  name: string;
  content: string;
  createdAt: string;
} 