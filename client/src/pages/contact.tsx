import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const mutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      toast({ title: "Message Sent!", description: "We'll get back to you as soon as possible." });
      setForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Required Fields", description: "Please fill name, email, and message.", variant: "destructive" });
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-3 bg-white/20 text-white border-white/30">Get in Touch</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-3">Contact Us</h1>
            <p className="text-primary-foreground/80 max-w-lg mx-auto">
              Have questions about a property or need expert advice? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 sm:p-8" data-testid="card-contact-form">
                <h2 className="text-xl font-semibold text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                      <Input
                        placeholder="Name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="Email id"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        data-testid="input-contact-email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Phone (optional)</label>
                    <Input
                      type="tel"
                      placeholder="Mobile No  "
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      data-testid="input-contact-phone"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Message *</label>
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={5}
                      data-testid="input-contact-message"
                    />
                  </div>
                  <Button type="submit" disabled={mutation.isPending} data-testid="button-send-contact">
                    <Send className="w-4 h-4 mr-2" />
                    {mutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: "Address", value: "address" },
                    { icon: Phone, label: "Phone", value: "+91 91041 53190 / +91 93136 85387" },
                    { icon: Mail, label: "Email", value: "email id" },
                    // { icon: Clock, label: "Hours", value: "Mon - Fri: 9AM - 6PM\nSat: 10AM - 4PM" },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
