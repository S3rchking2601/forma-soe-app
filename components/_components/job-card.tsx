'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  id: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  description: string;
}

export function JobCard({ id, title, department, location, jobType, description }: JobCardProps) {
  const truncatedDescription = description.length > 150 ? description.substring(0, 150) + '...' : description;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{department}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{truncatedDescription}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            {jobType}
          </Badge>
        </div>
        <Link href={`/jobs/${id}`}>
          <Button className="w-full" variant="default">
            View & Apply
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
