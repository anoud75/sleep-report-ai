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
      <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur border-border/50 shadow-[var(--shadow-elegant)]">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-primary mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent Successfully!</h3>
          <p className="text-muted-foreground text-center">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="medical-card rounded-2xl border-trust/20">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold font-jakarta glow-text">
          Get in Touch
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground font-inter">
          Have questions or need support? We're here to help.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your full name"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="bg-background/50 border-border/50 focus:border-trust hover:border-trust/50 transition-colors font-inter"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inquiryType" className="text-sm font-medium">
              Type of Inquiry *
            </Label>
            <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
              <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary transition-colors">
                <SelectValue placeholder="Select inquiry type" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border/50">
                {inquiryTypes.map((type) => (
                  <SelectItem key={type} value={type} className="focus:bg-primary/10">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Write your message here…"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary transition-colors min-h-[120px] resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="luxury-button haptic-feedback w-full font-inter tracking-wide"
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
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};