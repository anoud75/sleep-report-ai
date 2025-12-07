import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  userEmail: string;
  userName: string | null;
  approved: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ApprovalRequest = await req.json();
    const { userEmail, userName, approved } = body;

    console.log("Processing approval notification:", { userEmail, userName, approved });

    const subject = approved
      ? "Your Sleep Report AI account has been approved"
      : "Sleep Report AI account status update";

    const htmlContent = approved
      ? `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 32px; }
              .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
              .success-icon { width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
              .card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; }
              .cta { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px; }
              .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Sleep Report AI</div>
              </div>
              
              <div class="card">
                <div class="success-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 style="margin: 0 0 16px 0; color: #16a34a;">Account Approved</h2>
                <p style="margin: 0; color: #64748b;">
                  Hello ${userName || 'there'},<br><br>
                  Great news! Your Sleep Report AI account has been approved. You now have full access to the platform.
                </p>
                <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/analysis" class="cta">
                  Start Using Sleep Report AI
                </a>
              </div>
              
              <div class="footer">
                <p>Welcome to Sleep Report AI. We're excited to have you on board!</p>
              </div>
            </div>
          </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .header { text-align: center; margin-bottom: 32px; }
              .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
              .card { background: #fef2f2; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; }
              .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Sleep Report AI</div>
              </div>
              
              <div class="card">
                <h2 style="margin: 0 0 16px 0; color: #dc2626;">Registration Update</h2>
                <p style="margin: 0; color: #64748b;">
                  Hello ${userName || 'there'},<br><br>
                  We regret to inform you that your registration request was not approved at this time. 
                  If you believe this was a mistake, please contact the administrator.
                </p>
              </div>
              
              <div class="footer">
                <p>Thank you for your interest in Sleep Report AI.</p>
              </div>
            </div>
          </body>
        </html>
      `;

    const { error: emailError } = await resend.emails.send({
      from: "Sleep Report AI <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    if (emailError) {
      console.error("Error sending approval email:", emailError);
      throw emailError;
    }

    console.log(`Approval notification sent to ${userEmail}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-approval-notification:", error);
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
