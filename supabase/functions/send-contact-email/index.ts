import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  fullName: string;
  email: string;
  inquiryType: string;
  message: string;
}

// HTML escape function to prevent XSS in email clients
const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (match) => htmlEscapes[match] || match);
};

// Sanitize input to remove all HTML tags and dangerous content
const sanitizeInput = (str: string): string => {
  return str
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, inquiryType, message }: ContactRequest = await req.json();

    // Input validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Full name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for SMTP header injection patterns (newlines in email)
    if (/[\r\n]/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Length limits to prevent abuse
    if (fullName.length > 200 || email.length > 254 || message.length > 10000) {
      return new Response(JSON.stringify({ error: 'Input too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize inputs - remove all HTML and control characters
    const sanitizedFullName = sanitizeInput(fullName);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedInquiryType = sanitizeInput(inquiryType || 'General Inquiry');
    
    const recipientEmail = Deno.env.get('CONTACT_EMAIL') || 'alanoudsaud75@gmail.com';

    // Escape HTML for safe embedding in email HTML
    const escapedFullName = escapeHtml(sanitizedFullName);
    const escapedEmail = escapeHtml(sanitizedEmail);
    const escapedMessage = escapeHtml(sanitizedMessage).replace(/\n/g, '<br>');
    const escapedInquiryType = escapeHtml(sanitizedInquiryType);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          New Contact Form Submission - Sleep Report AI
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Contact Details</h3>
          
          <div style="margin-bottom: 15px;">
            <strong>Name:</strong> ${escapedFullName}<br>
            <strong>Email:</strong> ${escapedEmail}<br>
            <strong>Type of Inquiry:</strong> ${escapedInquiryType}
          </div>
          
          <div>
            <strong>Message:</strong>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #1e40af;">
              ${escapedMessage}
            </div>
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This message was sent from the Sleep Report AI contact form.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sleep Report AI <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Contact Form: ${escapedInquiryType} - ${escapedFullName}`,
      html: emailHtml,
      replyTo: sanitizedEmail,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);