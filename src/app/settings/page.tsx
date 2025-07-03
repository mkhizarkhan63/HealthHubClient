"use client";

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
import Link from "next/link";
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
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agent Settings</h1>
          </div>

          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-4">
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstMessage">First Message</Label>
                    <Textarea
                      id="firstMessage"
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      placeholder="Enter the first message the agent will say..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder="Enter the system prompt that guides the agent's behavior..."
                      className="min-h-32"
                    />
                  </div>

                  <Button 
                    onClick={() => updateConfigMutation.mutate({ 
                      firstMessage, 
                      systemPrompt 
                    })}
                    disabled={updateConfigMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Knowledge Base Files</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] })}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {/* Add new file form */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium">Add New File</h4>
                    <div className="space-y-2">
                      <Label htmlFor="newFileName">File Name</Label>
                      <Input
                        id="newFileName"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Enter file name..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newFileContent">Content</Label>
                      <Textarea
                        id="newFileContent"
                        value={newFileContent}
                        onChange={(e) => setNewFileContent(e.target.value)}
                        placeholder="Enter file content..."
                        className="min-h-32"
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
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {addKnowledgeFileMutation.isPending ? "Adding..." : "Add File"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Existing files */}
                  <div className="space-y-3">
                    {agentConfig?.knowledgebaseFiles?.map((file) => (
                      <div key={file.fileId} className="border rounded-lg p-3">
                        {editingFile === file.fileId ? (
                          <EditFileContent
                            file={file}
                            onSave={(content) => {
                              updateKnowledgeFileMutation.mutate({
                                fileId: file.fileId,
                                content,
                              });
                            }}
                            onCancel={() => setEditingFile(null)}
                            isSaving={updateKnowledgeFileMutation.isPending}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <h4 className="font-medium">{file.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingFile(file.fileId)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteKnowledgeFileMutation.mutate(file.fileId)}
                                disabled={deleteKnowledgeFileMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 