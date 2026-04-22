/**
 * EML File Generator Utility
 * Generates .eml (email) files that can be opened in Outlook and other email clients
 */

export interface EmlOptions {
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string;
  bcc?: string;
  isHtml?: boolean;
}

/**
 * Generate EML file content from email parameters
 * @param options Email options including recipient, subject, and body
 * @returns EML file content as string
 */
export function generateEmlContent(options: EmlOptions): string {
  const {
    to,
    subject,
    body,
    from = 'compose-email@outlook.com', // Placeholder - Outlook will use user's account
    cc = '',
    bcc = '',
    isHtml = true,
  } = options;

  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -5);
  const messageId = `<${timestamp}.${Math.random().toString(36).substring(2)}@outlook.com>`;

  // Build EML headers
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    cc ? `Cc: ${cc}` : '',
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
    `Content-Transfer-Encoding: 8bit`,
    `X-Mailer: HR Recruitment System`,
    '', // Blank line separator
  ]
    .filter((line) => line !== '')
    .join('\r\n');

  // Format body
  const formattedBody = isHtml
    ? `<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${body
        .split('\n')
        .map((line) => `<p>${line}</p>`)
        .join('')}</body></html>`
    : body;

  return `${headers}\r\n${formattedBody}`;
}

/**
 * Generate a downloadable EML file blob
 * @param options Email options
 * @returns Blob object suitable for download
 */
export function generateEmlBlob(options: EmlOptions): Blob {
  const emlContent = generateEmlContent(options);
  return new Blob([emlContent], { type: 'message/rfc822' });
}

/**
 * Generate filename for EML file based on recipient and subject
 * @param recipient Email recipient
 * @param subject Email subject
 * @returns Filename string
 */
export function generateEmlFilename(recipient: string, subject: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedSubject = subject
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 30);
  const recipientName = recipient.split('@')[0];
  return `${timestamp}_${recipientName}_${sanitizedSubject}.eml`;
}

/**
 * Create and trigger download of EML file
 * @param options Email options
 * @param recipient Email recipient for filename
 */
export function downloadEmlFile(options: EmlOptions, recipient: string): void {
  const blob = generateEmlBlob(options);
  const filename = generateEmlFilename(recipient, options.subject);
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
