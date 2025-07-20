"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Paper,
  Button,
  TextField,
  FormLabel,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Delete as Trash2,
  Add as Plus,
  Save,
  Description as FileText,
  ArrowBack as ArrowLeft,
  Refresh as RefreshCw
} from "@mui/icons-material";
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Loading <Box component="strong">{file.name}</Box>...
        </Typography>
        <Box sx={{ minHeight: 192, bgcolor: 'grey.100', borderRadius: 1, p: 1.5 }}>
          <Skeleton variant="text" height={192} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
        Editing: <Box component="strong">{file.name}</Box> ({content.length} characters)
      </Typography>
      <TextField
        multiline
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter file content..."
        variant="outlined"
        fullWidth
        sx={{
          '& .MuiInputBase-input': {
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }
        }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => onSave(content)}
          disabled={isSaving}
          startIcon={<Save />}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tabValue, setTabValue] = useState(0);

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
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Navigation />
        <Box
          component="main"
          sx={{
            pt: { xs: 10, sm: 12 },
            px: { xs: 2, sm: 3 },
            maxWidth: 768,
            mx: 'auto'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            <Skeleton variant="rectangular" sx={{ height: { xs: 24, sm: 32 } }} />
            <Skeleton variant="rectangular" sx={{ height: { xs: 256, sm: 384 } }} />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          pt: { xs: 10, sm: 12 },
          px: { xs: 2, sm: 3 },
          maxWidth: 768,
          mx: 'auto'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
          <Box>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary' }
                }}
              >
                <ArrowLeft sx={{ fontSize: 16, mr: 1 }} />
                Back to Dashboard
              </Box>
            </Link>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, mt:2 }}>
              Agent Settings
            </Typography>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="fullWidth"
            >
              <Tab label="Configuration" />
              <Tab label="Knowledge Base" />
            </Tabs>

            {/* Configuration Tab */}
            {tabValue === 0 && (
              <Box sx={{ mt: 3 }}>
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography
                        component="label"
                        htmlFor="firstMessage"
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, display: 'block' }}
                      >
                        First Message
                      </Typography>
                      <TextField
                        id="firstMessage"
                        multiline
                        rows={3}
                        value={firstMessage}
                        onChange={(e) => setFirstMessage(e.target.value)}
                        placeholder="Enter the first message the agent will say..."
                        variant="outlined"
                        fullWidth
                      />
                    </Box>

                    <Box>
                      <Typography
                        component="label"
                        htmlFor="systemPrompt"
                        variant="body2"
                        sx={{ fontWeight: 500, mb: 1, display: 'block' }}
                      >
                        System Prompt
                      </Typography>
                      <TextField
                        id="systemPrompt"
                        multiline
                        rows={4}
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Enter the system prompt that guides the agent's behavior..."
                        variant="outlined"
                        fullWidth
                      />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => updateConfigMutation.mutate({
                        firstMessage,
                        systemPrompt
                      })}
                      disabled={updateConfigMutation.isPending}
                      startIcon={<Save />}
                      sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                    >
                      {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Knowledge Base Tab */}
            {tabValue === 1 && (
              <Box sx={{ mt: 3 }}>
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Knowledge Base Files
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/agent/config"] })}
                        startIcon={<RefreshCw />}
                      >
                        Refresh
                      </Button>
                    </Box>

                    {/* Add new file form */}
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1.5 }}>
                        Add New File
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography
                            component="label"
                            htmlFor="newFileName"
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}
                          >
                            File Name
                          </Typography>
                          <TextField
                            id="newFileName"
                            size="small"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Enter file name..."
                            variant="outlined"
                            fullWidth
                          />
                        </Box>
                        <Box>
                          <Typography
                            component="label"
                            htmlFor="newFileContent"
                            variant="body2"
                            sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}
                          >
                            Content
                          </Typography>
                          <TextField
                            id="newFileContent"
                            multiline
                            rows={4}
                            value={newFileContent}
                            onChange={(e) => setNewFileContent(e.target.value)}
                            placeholder="Enter file content..."
                            variant="outlined"
                            fullWidth
                          />
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => {
                            if (newFileName && newFileContent) {
                              addKnowledgeFileMutation.mutate({
                                name: newFileName,
                                content: newFileContent,
                              });
                            }
                          }}
                          disabled={!newFileName || !newFileContent || addKnowledgeFileMutation.isPending}
                          startIcon={<Plus />}
                        >
                          {addKnowledgeFileMutation.isPending ? "Adding..." : "Add File"}
                        </Button>
                      </Box>
                    </Paper>

                    <Divider />

                    {/* Existing files */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {agentConfig?.knowledgebaseFiles?.map((file) => (
                        <Paper key={file.fileId} variant="outlined" sx={{ p: 1.5 }}>
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
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <FileText sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {file.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {new Date(file.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => setEditingFile(file.fileId)}
                                >
                                  Edit
                                </Button>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => deleteKnowledgeFileMutation.mutate(file.fileId)}
                                  disabled={deleteKnowledgeFileMutation.isPending}
                                >
                                  <Trash2 />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 