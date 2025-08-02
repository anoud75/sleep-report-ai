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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, inquiryType, message }: ContactRequest = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
          New Contact Form Submission - Sleep Report AI
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">Contact Details</h3>
          
          <div style="margin-bottom: 15px;">
            <strong>Name:</strong> ${fullName}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Type of Inquiry:</strong> ${inquiryType}
          </div>
          
          <div>
            <strong>Message:</strong>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px; border-left: 4px solid #1e40af;">
              ${message.replace(/\n/g, '<br>')}
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
      to: ["alanoudsaud75@gmail.com"],
      subject: `Contact Form: ${inquiryType} - ${fullName}`,
      html: emailHtml,
      replyTo: email,
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);