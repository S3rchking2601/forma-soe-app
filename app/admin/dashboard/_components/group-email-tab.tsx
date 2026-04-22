'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Send, HelpCircle, CheckCircle2, Download } from 'lucide-react';
import { getAvailableVariables } from '@/lib/email-template-engine';
import { downloadEmlFile } from '@/lib/eml-generator';
import { replaceTemplateVariables, getTemplateVariables } from '@/lib/email-template-engine';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  applications?: Application[];
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  applicationDate: string;
  job?: {
    id: string;
    title: string;
    department: string;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface SendResult {
  candidateId: string;
  candidateName: string;
  email: string;
  status: 'sent' | 'failed';
  error?: string;
}

export default function GroupEmailTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [useTemplate, setUseTemplate] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SendResult[]>([]);

  // Filters
  const [filterJob, setFilterJob] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [uniqueJobs, setUniqueJobs] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, templatesRes] = await Promise.all([
          fetch('/api/candidates'),
          fetch('/api/email-templates'),
        ]);

        if (candidatesRes.ok) {
          const candData = await candidatesRes.json();
          setCandidates(candData || []);
          setFilteredCandidates(candData || []);

          // Extract unique jobs
          const jobs = new Map<string, { id: string; title: string }>();
          candData.forEach((candidate: Candidate) => {
            candidate.applications?.forEach(app => {
              if (app.job && !jobs.has(app.job.id)) {
                jobs.set(app.job.id, { id: app.job.id, title: app.job.title });
              }
            });
          });
          setUniqueJobs(Array.from(jobs.values()));
        }

        if (templatesRes.ok) {
          const templData = await templatesRes.json();
          setTemplates(templData || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...candidates];

    if (filterJob) {
      filtered = filtered.filter(c =>
        c.applications?.some(app => app.job?.id === filterJob)
      );
    }

    if (filterStatus) {
      filtered = filtered.filter(c =>
        c.applications?.some(app => app.status === filterStatus)
      );
    }

    setFilteredCandidates(filtered);
  }, [filterJob, filterStatus, candidates]);

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'custom') {
      setUseTemplate('custom');
      return;
    }
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setUseTemplate(templateId);
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  const handleCandidateToggle = (candidateId: string) => {
    const newSet = new Set(selectedCandidates);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setSelectedCandidates(newSet);
  };

  const handleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c.id)));
    }
  };

  const handleSendEmails = async () => {
    if (selectedCandidates.size === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    if (!body) {
      toast.error('Please enter email body');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/emails/send-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: Array.from(selectedCandidates),
          templateId: useTemplate && useTemplate !== 'custom' ? useTemplate : undefined,
          subject: subject || 'Email from HR',
          body,
          useTemplate: useTemplate !== 'custom',
          filterJob,
          filterStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to send emails');
        return;
      }

      const data = await response.json();
      setResults(data.results);
      setShowResults(true);
      toast.success(`${data.summary.sent} email(s) sent successfully`);
      
      // Reset form
      setSelectedCandidates(new Set());
      setUseTemplate('');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const handleExportToOutlook = () => {
    if (selectedCandidates.size === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    if (!body) {
      toast.error('Please enter email body');
      return;
    }

    try {
      let exportedCount = 0;
      
      // Export EML file for each selected candidate
      filteredCandidates.forEach(candidate => {
        if (selectedCandidates.has(candidate.id)) {
          // Get template variables for this candidate
          const templateVars = getTemplateVariables(candidate, undefined);
          
          // Replace variables in subject and body
          const processedSubject = replaceTemplateVariables(
            subject || 'Email from HR',
            templateVars
          );
          const processedBody = replaceTemplateVariables(body, templateVars);
          
          // Download EML file
          downloadEmlFile(
            {
              to: candidate.email,
              subject: processedSubject,
              body: processedBody,
              isHtml: true,
            },
            candidate.email
          );
          exportedCount++;
        }
      });

      toast.success(`${exportedCount} email(s) exported! Open each .eml file with Outlook to send.`);
    } catch (error) {
      console.error('Error exporting emails:', error);
      toast.error('Failed to export emails');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showResults && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-base">Send Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {results.map(result => (
              <div key={result.candidateId} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{result.candidateName}</p>
                  <p className="text-xs text-muted-foreground">{result.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {result.status === 'sent' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <span className="text-xs text-red-500">Failed</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
          <div className="px-6 py-4 border-t">
            <Button onClick={() => setShowResults(false)} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Group Email</CardTitle>
          <CardDescription>
            Send personalized emails to multiple candidates at once with template variable support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Job Position</Label>
              <Select value={filterJob || "all"} onValueChange={(v) => setFilterJob(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All positions</SelectItem>
                  {uniqueJobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Application Status</Label>
              <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Candidate Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Candidates ({selectedCandidates.size}/{filteredCandidates.length})</Label>
              {filteredCandidates.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {selectedCandidates.size === filteredCandidates.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            <div className="border rounded p-4 space-y-2 max-h-48 overflow-y-auto bg-muted/30">
              {filteredCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No candidates match your filters</p>
              ) : (
                filteredCandidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center gap-2">
                    <Checkbox
                      id={candidate.id}
                      checked={selectedCandidates.has(candidate.id)}
                      onCheckedChange={() => handleCandidateToggle(candidate.id)}
                    />
                    <label htmlFor={candidate.id} className="text-sm cursor-pointer flex-1">
                      {candidate.firstName} {candidate.lastName} ({candidate.email})
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Email Template (Optional)</Label>
            <Select value={useTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or write custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Email</SelectItem>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              placeholder="Email subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Email Body</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowHelp(!showHelp)}
                className="h-6 w-6 p-0"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Write your email message here. Use variables like {{firstName}}, {{position}}, {{company}}"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
            />
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium mb-2">Available Template Variables:</p>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableVariables().map(variable => (
                  <code key={variable} className="text-xs bg-white p-1 rounded border">
                    {variable}
                  </code>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                These variables will be automatically replaced with each candidate's information
              </p>
            </div>
          )}

          {/* Send Buttons */}
          <div className="pt-4 grid grid-cols-2 gap-3">
            <Button
              onClick={handleSendEmails}
              disabled={selectedCandidates.size === 0 || !body || sending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Now'}
            </Button>
            <Button
              onClick={handleExportToOutlook}
              disabled={selectedCandidates.size === 0 || !body}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export to Outlook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
