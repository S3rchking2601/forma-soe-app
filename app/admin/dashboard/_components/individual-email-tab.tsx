'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Send, HelpCircle, Download } from 'lucide-react';
import { getAvailableVariables } from '@/lib/email-template-engine';
import { downloadEmlFile } from '@/lib/eml-generator';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  applications?: any[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export default function IndividualEmailTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [useTemplate, setUseTemplate] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);

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
        }

        if (templatesRes.ok) {
          const templData = await templatesRes.json();
          setTemplates(templData || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load candidates or templates');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleSendEmail = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    if (!body) {
      toast.error('Please enter email body');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/emails/send-individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: selectedCandidate,
          templateId: useTemplate && useTemplate !== 'custom' ? useTemplate : undefined,
          subject: subject || 'Email from HR',
          body,
          useTemplate: useTemplate !== 'custom',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to send email');
        return;
      }

      const candidate = candidates.find(c => c.id === selectedCandidate);
      toast.success(`Email sent to ${candidate?.firstName} ${candidate?.lastName}`);
      
      // Reset form
      setSelectedCandidate('');
      setUseTemplate('');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleExportToOutlook = () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    if (!body) {
      toast.error('Please enter email body');
      return;
    }

    try {
      const candidate = candidates.find(c => c.id === selectedCandidate);
      downloadEmlFile(
        {
          to: candidate?.email || '',
          subject: subject || 'Email from HR',
          body,
          isHtml: true,
        },
        candidate?.email || ''
      );
      toast.success('Email exported! Open the .eml file with Outlook to send.');
    } catch (error) {
      console.error('Error exporting email:', error);
      toast.error('Failed to export email');
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

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Send Individual Email</CardTitle>
          <CardDescription>
            Send personalized emails to a single candidate with template variable support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Candidate Selection */}
          <div className="space-y-2">
            <Label>Select Candidate</Label>
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map(candidate => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.firstName} {candidate.lastName} ({candidate.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Candidate Preview */}
          {selectedCandidateData && (
            <div className="p-3 bg-muted rounded border">
              <p className="text-sm">
                <strong>Email:</strong> {selectedCandidateData.email}
              </p>
              {selectedCandidateData.applications && selectedCandidateData.applications.length > 0 && (
                <p className="text-sm mt-1">
                  <strong>Applied for:</strong> {selectedCandidateData.applications.map(a => a.job?.title).join(', ')}
                </p>
              )}
            </div>
          )}

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
                These variables will be automatically replaced with the candidate's information
              </p>
            </div>
          )}

          {/* Send Buttons */}
          <div className="pt-4 grid grid-cols-2 gap-3">
            <Button
              onClick={handleSendEmail}
              disabled={!selectedCandidate || !body || sending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Now'}
            </Button>
            <Button
              onClick={handleExportToOutlook}
              disabled={!selectedCandidate || !body}
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
