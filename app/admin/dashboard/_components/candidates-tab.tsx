'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDown, Loader2 } from 'lucide-react';

interface Application {
  id: string;
  status: string;
  applicationDate: string;
  resumePath?: string;
  job?: {
    title: string;
  };
  candidate?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  createdAt: string;
  applications: Application[];
}

export default function CandidatesTab() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadResume = async (resumePath: string, candidateName: string) => {
    setDownloadingId(resumePath);
    try {
      const response = await fetch(`/api/files/download?path=${encodeURIComponent(resumePath)}`);
      if (!response.ok) throw new Error('Failed to get download URL');
      const { downloadUrl } = await response.json();
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Resume_${candidateName.replace(/\s+/g, '_')}.pdf`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Resume download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/candidates');
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }
        const data = (await response.json()) ?? [];
        setCandidates(data);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
        toast.error('Failed to load candidates');
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getStatusColor = (status: string | undefined) => {
    const statusStr = status?.toLowerCase() ?? 'pending';
    switch (statusStr) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading candidates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Candidates</CardTitle>
        <CardDescription>
          {candidates?.length ?? 0} total candidates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {candidates?.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied Jobs</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates?.map((candidate) => (
                  <TableRow key={candidate?.id}>
                    <TableCell className="font-medium">
                      {candidate?.firstName} {candidate?.lastName}
                    </TableCell>
                    <TableCell>{candidate?.email}</TableCell>
                    <TableCell>{candidate?.phone}</TableCell>
                    <TableCell>{candidate?.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {candidate?.applications?.map((app) => (
                          <Badge
                            key={app?.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {app?.job?.title ?? 'Unknown'}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const appWithResume = candidate?.applications?.find(
                          (app) => app.resumePath
                        );
                        if (appWithResume?.resumePath) {
                          const isDownloading = downloadingId === appWithResume.resumePath;
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDownloadResume(
                                  appWithResume.resumePath!,
                                  `${candidate.firstName}_${candidate.lastName}`
                                )
                              }
                              disabled={isDownloading}
                              className="gap-1.5"
                            >
                              {isDownloading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FileDown className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">
                                {isDownloading ? 'Downloading...' : 'Download'}
                              </span>
                            </Button>
                          );
                        }
                        return (
                          <span className="text-xs text-muted-foreground">
                            No resume
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {candidate?.createdAt
                        ? new Date(candidate.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No candidates found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
