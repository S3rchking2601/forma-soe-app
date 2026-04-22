'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layouts/container';
import { PageHeader } from '@/components/layouts/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Mail, LogOut, Briefcase, Send } from 'lucide-react';
import { signOut } from 'next-auth/react';
import CandidatesTab from './_components/candidates-tab';
import EmailTemplatesTab from './_components/email-templates-tab';
import JobsTab from './_components/jobs-tab';
import IndividualEmailTab from './_components/individual-email-tab';
import GroupEmailTab from './_components/group-email-tab';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession() ?? {};
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Container size="lg">
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Container>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <Container size="lg">
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            title="Admin Dashboard"
            description="Manage positions, candidates, and communications"
          />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="jobs" className="flex items-center gap-2 flex-1 min-w-0">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span className="truncate">Positions</span>
            </TabsTrigger>
            <TabsTrigger value="candidates" className="flex items-center gap-2 flex-1 min-w-0">
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Candidates</span>
            </TabsTrigger>
            <TabsTrigger value="individual-email" className="flex items-center gap-2 flex-1 min-w-0">
              <Send className="w-4 h-4 shrink-0" />
              <span className="truncate">Individual</span>
            </TabsTrigger>
            <TabsTrigger value="group-email" className="flex items-center gap-2 flex-1 min-w-0">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">Group</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 flex-1 min-w-0">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">Templates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <JobsTab />
          </TabsContent>

          <TabsContent value="candidates" className="space-y-4">
            <CandidatesTab />
          </TabsContent>

          <TabsContent value="individual-email" className="space-y-4">
            <IndividualEmailTab />
          </TabsContent>

          <TabsContent value="group-email" className="space-y-4">
            <GroupEmailTab />
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <EmailTemplatesTab />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
