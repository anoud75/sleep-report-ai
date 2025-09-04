import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle } from "lucide-react";

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    inquiryType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const inquiryTypes = [
    'Business Opportunity',
    'General Inquiry',
    'Report a Technical Issue',
    'Feedback or Suggestion',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.inquiryType || !formData.message) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          fullName: '',
          email: '',
          inquiryType: '',
          message: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="medical-card rounded-2xl border-success/30 bg-black/60 backdrop-blur-xl">
        <div className="flex flex-col items-center justify-center py-12 px-8">
          <CheckCircle className="h-16 w-16 text-success mb-4 protocol-icon" />
          <h3 className="text-xl font-semibold text-white mb-2 font-jakarta">Message Sent Successfully!</h3>
          <p className="text-white/70 text-center font-inter">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-card rounded-2xl border-trust/20 bg-black/60 backdrop-blur-xl max-w-2xl mx-auto">
      <div className="text-center p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold font-jakarta glow-text text-white mb-2">
          Get in Touch
        </h2>
        <p className="text-white/70 font-inter">
          Have questions or need support? We're here to help.
        </p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-white font-inter">
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-trust hover:border-white/40 transition-colors font-inter focus:outline-none focus:ring-2 focus:ring-trust/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white font-inter">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-trust hover:border-white/40 transition-colors font-inter focus:outline-none focus:ring-2 focus:ring-trust/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="inquiryType" className="text-sm font-medium text-white font-inter">
              Type of Inquiry *
            </label>
            <select 
              value={formData.inquiryType} 
              onChange={(e) => handleInputChange('inquiryType', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-trust hover:border-white/40 transition-colors font-inter focus:outline-none focus:ring-2 focus:ring-trust/20"
              required
            >
              <option value="" className="bg-black text-white">Select inquiry type</option>
              {inquiryTypes.map((type) => (
                <option key={type} value={type} className="bg-black text-white">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-white font-inter">
              Message *
            </label>
            <textarea
              id="message"
              placeholder="Write your message here…"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:border-trust hover:border-white/40 transition-colors min-h-[120px] resize-none font-inter focus:outline-none focus:ring-2 focus:ring-trust/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-trust to-trust/80 text-white font-semibold font-inter rounded-xl hover:from-trust/90 hover:to-trust/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};