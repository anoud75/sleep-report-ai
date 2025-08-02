import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  rating: number;
  feedback: string;
  reportData: {
    patientName: string;
    studyType: string;
    timestamp: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rating, feedback, reportData }: FeedbackRequest = await req.json();

    // Input validation
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (feedback && typeof feedback !== 'string') {
      return new Response(JSON.stringify({ error: 'Feedback must be a string' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize feedback
    const sanitizedFeedback = feedback ? feedback.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim() : '';
    
    const recipientEmail = Deno.env.get('FEEDBACK_EMAIL') || 'alanoudsaud75@gmail.com';

    const stars = "⭐".repeat(rating);
    const formattedDate = new Date(reportData.timestamp).toLocaleString();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          Sleep Report AI - User Feedback
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Rating: ${stars} (${rating}/5)</h3>
          
          <div style="margin-bottom: 15px;">
            <strong>Report Details:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Patient: ${reportData.patientName}</li>
              <li>Study Type: ${reportData.studyType}</li>
              <li>Generated: ${formattedDate}</li>
            </ul>
          </div>
          
          ${sanitizedFeedback ? `
            <div>
              <strong>User Feedback:</strong>
              <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #1e40af;">
                "${sanitizedFeedback}"
              </div>
            </div>
          ` : ''}
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This feedback was automatically sent from Sleep Report AI.
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sleep Report AI <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Sleep Report Feedback - ${stars} Rating`,
      html: emailHtml,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending feedback email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);