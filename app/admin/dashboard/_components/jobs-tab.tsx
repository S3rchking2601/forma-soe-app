'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, MapPin, Briefcase, Users, Globe, GlobeLock, Copy, Check } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  jobType: string;
  status: string;
  createdAt: string;
  applications?: any[];
}

const emptyFormData = {
  title: '',
  description: '',
  department: '',
  location: '',
  jobType: 'Full-time',
  status: 'active',
};

const MAX_POSITIONS = 100;

export default function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [jobBoardPublic, setJobBoardPublic] = useState(false);
  const [togglingBoard, setTogglingBoard] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch('/api/settings?key=jobBoardPublic');
        const data = await res.json();
        setJobBoardPublic(data?.value === 'true');
      } catch { /* default false */ }
    };
    fetchSetting();
  }, []);

  const toggleJobBoard = async () => {
    setTogglingBoard(true);
    try {
      const newValue = !jobBoardPublic;
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'jobBoardPublic', value: String(newValue) }),
      });
      if (res.ok) {
        setJobBoardPublic(newValue);
        toast.success(`Public job board ${newValue ? 'enabled' : 'disabled'}`);
      } else {
        toast.error('Failed to update setting');
      }
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setTogglingBoard(false);
    }
  };

  const copyJobBoardLink = async () => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/jobs`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?status=all');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async () => {
    if (!formData.title || !formData.description || !formData.department || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Job created successfully');
        setIsCreateOpen(false);
        setFormData(emptyFormData);
        fetchJobs();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create job');
      }
    } catch (error) {
      toast.error('Failed to create job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedJob) return;
    if (!formData.title || !formData.description || !formData.department || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Job updated successfully');
        setIsEditOpen(false);
        setSelectedJob(null);
        setFormData(emptyFormData);
        fetchJobs();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update job');
      }
    } catch (error) {
      toast.error('Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${selectedJob.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Job removed successfully');
        setIsDeleteOpen(false);
        setSelectedJob(null);
        fetchJobs();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete job');
      }
    } catch (error) {
      toast.error('Failed to delete job');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      jobType: job.jobType,
      status: job.status,
    });
    setIsEditOpen(true);
  };

  const openDelete = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const JobFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Senior Software Engineer"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            placeholder="e.g. Engineering"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g. New York, NY or Remote"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Type</Label>
          <Select
            value={formData.jobType}
            onValueChange={(value) => setFormData({ ...formData, jobType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Enter job description..."
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading jobs...</p>
        </CardContent>
      </Card>
    );
  }

  const activeJobCount = jobs.filter(j => j.status !== 'closed').length;

  return (
    <div className="space-y-4">
      {/* Job Board Toggle Card */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {jobBoardPublic ? (
                <Globe className="w-5 h-5 text-emerald-500" />
              ) : (
                <GlobeLock className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">Public Job Board</p>
                <p className="text-xs text-muted-foreground">
                  {jobBoardPublic ? 'Candidates can view and apply to open positions' : 'Job board is hidden from public access'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{activeJobCount} / {MAX_POSITIONS} positions</span>
              <Switch
                checked={jobBoardPublic}
                onCheckedChange={toggleJobBoard}
                disabled={togglingBoard}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shareable Link Card - Only when Public */}
      {jobBoardPublic && (
        <Card className="border-emerald-500/30 bg-emerald-50/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Share Job Board Link</p>
                <div className="flex items-center gap-2 p-3 bg-muted rounded border border-dashed">
                  <code className="flex-1 text-sm text-foreground break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/jobs
                  </code>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyJobBoardLink}
                className="h-10 px-3"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Positions</CardTitle>
              <CardDescription>
                Manage all job postings — {jobs.length} total position{jobs.length !== 1 ? 's' : ''} ({activeJobCount} active, max {MAX_POSITIONS})
              </CardDescription>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) setFormData(emptyFormData); }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" disabled={activeJobCount >= MAX_POSITIONS}>
                  <Plus className="w-4 h-4" />
                  New Position
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create New Position</DialogTitle>
                  <DialogDescription>Add a new job position to the board.</DialogDescription>
                </DialogHeader>
                <JobFormFields />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Position'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No positions found. Create your first job posting!</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Title</TableHead>
                    <TableHead className="min-w-[100px]">Department</TableHead>
                    <TableHead className="min-w-[130px]">Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {job.location}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{job.jobType}</Badge></TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {job.applications?.length || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDelete(job)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setSelectedJob(null); setFormData(emptyFormData); } }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>Update the job position details.</DialogDescription>
          </DialogHeader>
          <JobFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => { setIsDeleteOpen(open); if (!open) setSelectedJob(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedJob?.title}&quot;?
              {selectedJob?.applications && selectedJob.applications.length > 0
                ? ' This job has existing applications and will be marked as closed instead.'
                : ' This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
