import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationRequest {
  userId: string;
  userEmail: string;
  userName: string;
  organizationId: string | null;
  organizationName: string | null;
  isNewOrganization: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RegistrationRequest = await req.json();
    const { userId, userEmail, userName, organizationId, organizationName, isNewOrganization } = body;

    console.log("Processing registration notification:", { userEmail, userName, organizationName, isNewOrganization });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find super admin(s)
    const { data: superAdmins, error: saError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin");

    if (saError) {
      console.error("Error fetching super admins:", saError);
    }

    const superAdminEmails: string[] = [];
    if (superAdmins && superAdmins.length > 0) {
      for (const sa of superAdmins) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", sa.user_id)
          .single();
        if (profile?.email) {
          superAdminEmails.push(profile.email);
        }
      }
    }

    const emailsToNotify = [...superAdminEmails];

    // If joining existing org, also notify org admin
    if (!isNewOrganization && organizationId) {
      const { data: orgAdmins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (orgAdmins) {
        for (const admin of orgAdmins) {
          const { data: adminProfile } = await supabase
            .from("profiles")
            .select("email, organization_id")
            .eq("id", admin.user_id)
            .single();

          if (adminProfile?.email && adminProfile.organization_id === organizationId) {
            if (!emailsToNotify.includes(adminProfile.email)) {
              emailsToNotify.push(adminProfile.email);
            }
          }
        }
      }
    }

    if (emailsToNotify.length === 0) {
      console.log("No admins to notify");
      return new Response(JSON.stringify({ success: true, message: "No admins to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const subject = isNewOrganization
      ? `New Organization Registration: ${organizationName}`
      : `New User Registration: ${userName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .card { background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 500; color: #1e293b; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
            .badge-new { background: #dbeafe; color: #1d4ed8; }
            .badge-join { background: #dcfce7; color: #16a34a; }
            .cta { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin-top: 16px; }
            .footer { text-align: center; margin-top: 32px; font-size: 14px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Sleep Report AI</div>
              <p style="color: #64748b; margin-top: 8px;">Admin Notification</p>
            </div>
            
            <div class="card">
              <p style="margin: 0 0 16px 0;">
                ${isNewOrganization 
                  ? `A new organization has registered and requires your approval.`
                  : `A new user has requested to join an organization.`
                }
              </p>
              
              <div style="margin-bottom: 16px;">
                <div class="label">Type</div>
                <span class="badge ${isNewOrganization ? 'badge-new' : 'badge-join'}">
                  ${isNewOrganization ? 'New Organization' : 'Join Request'}
                </span>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div class="label">Name</div>
                <div class="value">${userName || 'Not provided'}</div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div class="label">Email</div>
                <div class="value">${userEmail}</div>
              </div>
              
              ${organizationName ? `
                <div style="margin-bottom: 16px;">
                  <div class="label">Organization</div>
                  <div class="value">${organizationName}</div>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="${supabaseUrl.replace('.supabase.co', '.lovable.app')}/super-admin" class="cta">
                Review in Admin Panel
              </a>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from Sleep Report AI.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    for (const email of emailsToNotify) {
      const { error: emailError } = await resend.emails.send({
        from: "Sleep Report AI <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: htmlContent,
      });

      if (emailError) {
        console.error(`Error sending email to ${email}:`, emailError);
      } else {
        console.log(`Notification sent to ${email}`);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-registration-notification:", error);
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
