import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save, FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Link } from "wouter";
import type { 
  AgentConfigDto, 
  KnowledgeBaseFileDto, 
  UpdateAgentConfigDto,
  CreateKnowledgeBaseFileDto,
  UpdateKnowledgeBaseFileDto
} from "@/types/api";

interface EditFileContentProps {
  file: KnowledgeBaseFileDto;
  onSave: (content: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function EditFileContent({ file, onSave, onCancel, isSaving }: EditFileContentProps) {
  const [content, setContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  // Fetch the full file content when component mounts
  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await apiRequest("GET", `/api/agent/knowledgebase/${file.fileId}`);
        const fileData = await response.json();

        setContent(fileData.extracted_inner_html || fileData.content || fileData.text || "");
      } catch (error) {
        console.error('Error fetching file content:', error);
        setContent(file.content || "");
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFileContent();
  }, [file.fileId, file.content]);

  if (isLoadingContent) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground mb-2">
          Loading <strong>{file.name}</strong>...
        </div>
        <div className="min-h-48 bg-muted/50 rounded p-3 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-2">
        Editing: <strong>{file.name}</strong> ({content.length} characters)
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-48 font-mono text-sm"
        placeholder="Enter file content..."
      />
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={() => onSave(content)}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const { data: agentConfig, isLoading } = useQuery<AgentConfigDto>({
    queryKey: ["/api/agent/config"],
  });

  // Update local state when agent config loads
  useEffect(() => {
    if (agentConfig) {
      setFirstMessage(agentConfig.firstMessage || "");
      setSystemPrompt(agentConfig.systemPrompt || "");
    }
  }, [agentConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<UpdateAgentConfigDto>) => {
      const response = await apiRequest("PATCH", "/api/agent/config", updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] });
      toast({
        title: "Configuration Updated",
        description: "Agent settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update agent configuration.",
        variant: "destructive",
      });
    },
  });

  const addKnowledgeFileMutation = useMutation({
    mutationFn: async (file: { name: string; content: string }) => {
      const response = await apiRequest("POST", "/api/agent/knowledgebase", file);
      return response.json();
    },
    onSuccess: () => {
      // Clear form first
      setNewFileName("");
      setNewFileContent("");
      
      // Force refresh after a short delay to ensure ElevenLabs has processed the file
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] });
      }, 1000);
      
      toast({
        title: "File Added",
        description: "Knowledge base file added successfully.",
      });
    },
  });

  const updateKnowledgeFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      const response = await apiRequest("PATCH", `/api/agent/knowledgebase/${fileId}`, { content });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] });
      setEditingFile(null);
      toast({
        title: "File Updated",
        description: "Knowledge base file updated successfully.",
      });
    },
  });

  const deleteKnowledgeFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("DELETE", `/api/agent/knowledgebase/${fileId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] });
      toast({
        title: "File Deleted",
        description: "Knowledge base file deleted successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted">
        <Navigation />
        <main className="pt-20 sm:pt-24 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-card rounded animate-pulse" />
            <div className="h-64 sm:h-96 bg-card rounded animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navigation />
      
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">AI Agent Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configure your Support Agent's behavior and knowledge base
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Configuration</TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs sm:text-sm">Knowledge Base</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="first-message">First Message</Label>
                    <Button
                      size="sm"
                      onClick={() => updateConfigMutation.mutate({ firstMessage })}
                      disabled={updateConfigMutation.isPending || firstMessage === agentConfig?.firstMessage}
                    >
                      {updateConfigMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    The greeting message patients hear when they call
                  </p>
                  <Textarea
                    id="first-message"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    className="min-h-32"
                    placeholder="Enter the first message patients will hear..."
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Button
                      size="sm"
                      onClick={() => updateConfigMutation.mutate({ system_prompt: systemPrompt })}
                      disabled={updateConfigMutation.isPending || systemPrompt === agentConfig?.system_prompt}
                    >
                      {updateConfigMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Instructions that guide the AI's behavior and responses
                  </p>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="min-h-48"
                    placeholder="Enter system instructions for the AI agent..."
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    The clinic's phone number patients will call
                  </p>
                  <Input
                    id="phone-number"
                    defaultValue={agentConfig?.phone_number || ""}
                    placeholder="+61 7 4516 1082"
                    onBlur={(e) => {
                      updateConfigMutation.mutate({ phone_number: e.target.value });
                    }}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Knowledge Base Files</h3>
                    <p className="text-sm text-muted-foreground">
                      Add information files that help the AI answer patient questions accurately
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] })}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Sync Knowledge Base</span>
                    <span className="sm:hidden">Sync</span>
                  </Button>
                </div>

                {/* Add New File */}
                <div className="border rounded-lg p-4 bg-muted">
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New File</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="new-file-name">File Name</Label>
                        <Input
                          id="new-file-name"
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="e.g., clinic-hours.txt"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-file-content">Content</Label>
                      <Textarea
                        id="new-file-content"
                        value={newFileContent}
                        onChange={(e) => setNewFileContent(e.target.value)}
                        placeholder="Enter the information content..."
                        className="min-h-24"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (newFileName && newFileContent) {
                          addKnowledgeFileMutation.mutate({
                            name: newFileName,
                            content: newFileContent,
                          });
                        }
                      }}
                      disabled={!newFileName || !newFileContent || addKnowledgeFileMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add File
                    </Button>
                  </div>
                </div>

                {/* Existing Files */}
                <div className="space-y-4">
                  {agentConfig?.knowledgebase_files?.map((file) => (
                    <div key={file.file_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {new Date(file.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFile(editingFile === file.file_id ? null : file.file_id);
                            }}
                          >
                            {editingFile === file.file_id ? "Cancel" : "Edit"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteKnowledgeFileMutation.mutate(file.file_id)}
                            disabled={deleteKnowledgeFileMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingFile === file.file_id ? (
                        <div className="mt-4">
    
                          <EditFileContent
                            file={file}
                            onSave={(content) => {
                              updateKnowledgeFileMutation.mutate({
                                fileId: file.file_id,
                                content,
                              });
                            }}
                            onCancel={() => setEditingFile(null)}
                            isSaving={updateKnowledgeFileMutation.isPending}
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground bg-muted/50 rounded p-3 max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-xs">
                            {file.content.substring(0, 500)}
                            {file.content.length > 500 && "\n\n... (content truncated)"}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!agentConfig?.knowledgebase_files?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No knowledge base files yet</p>
                      <p className="text-sm">Add files to help your AI provide better answers</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}