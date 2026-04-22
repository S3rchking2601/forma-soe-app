/**
 * Email Template Variable Substitution Engine
 * Handles replacing variables like {{firstName}}, {{position}}, {{company}} in email templates
 */

interface TemplateVariables {
  firstName?: string;
  lastName?: string;
  candidateName?: string;
  position?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  company?: string;
  applicationDate?: string | Date | null;
  [key: string]: string | undefined | Date | null;
}

/**
 * Convert a value to string, handling Date and null/undefined
 */
function valueToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return String(value);
}

/**
 * Replace all template variables in a string
 * Supports {{variableName}} syntax
 * @param template - The template string with {{variables}}
 * @param variables - Object containing variable values
 * @returns Processed string with variables replaced
 */
export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  // Match all {{variableName}} patterns
  const variablePattern = /\{\{([^}]+)\}\}/g;

  result = result.replace(variablePattern, (match, variableName) => {
    const trimmedName = variableName.trim();
    const value = variables[trimmedName];
    
    // If variable is not found, leave it as is or replace with empty string
    if (value !== undefined && value !== null) {
      return valueToString(value);
    }
    return '';
  });

  return result;
}

/**
 * Get available template variables for a candidate
 * @param candidate - Candidate object with name, email, etc
 * @param application - Application object with job details
 * @returns Object with all available variables
 */
export function getTemplateVariables(
  candidate: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  },
  application?: {
    id?: string;
    job?: {
      id?: string;
      title?: string;
      department?: string;
      location?: string;
    };
    applicationDate?: Date | string | null;
  } | null
): TemplateVariables {
  const variables: TemplateVariables = {};

  // Candidate variables
  if (candidate.firstName) variables.firstName = candidate.firstName;
  if (candidate.lastName) variables.lastName = candidate.lastName;
  if (candidate.firstName && candidate.lastName) {
    variables.candidateName = `${candidate.firstName} ${candidate.lastName}`;
  } else if (candidate.firstName) {
    variables.candidateName = candidate.firstName;
  }

  // Job/Position variables
  if (application?.job?.title) {
    variables.position = application.job.title;
    variables.jobTitle = application.job.title;
  }
  if (application?.job?.department) {
    variables.department = application.job.department;
  }
  if (application?.job?.location) {
    variables.location = application.job.location;
  }

  // Company variable (can be customized)
  variables.company = 'Our Company';

  // Application variables
  if (application?.applicationDate) {
    if (application.applicationDate instanceof Date) {
      variables.applicationDate = application.applicationDate;
    } else if (typeof application.applicationDate === 'string') {
      variables.applicationDate = new Date(application.applicationDate).toLocaleDateString();
    }
  }

  return variables;
}

/**
 * Get list of available template variables for documentation
 */
export function getAvailableVariables(): string[] {
  return [
    '{{firstName}}',
    '{{lastName}}',
    '{{candidateName}}',
    '{{position}}',
    '{{jobTitle}}',
    '{{department}}',
    '{{location}}',
    '{{company}}',
    '{{applicationDate}}',
  ];
}
