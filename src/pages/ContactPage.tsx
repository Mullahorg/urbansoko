import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
 import { Mail, Phone, MapPin, Clock, Send, Hexagon, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
 import { motion } from 'framer-motion';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
        {/* Hero Section */}
         <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 overflow-hidden">
           <div className="absolute inset-0 hex-pattern opacity-20" />
          <div className="container mx-auto px-4">
             <motion.div 
               className="max-w-3xl mx-auto text-center relative z-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                 <MessageSquare className="h-4 w-4" />
                 Get in Touch
               </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-lg text-muted-foreground">
                We'd love to hear from you. Reach out with any questions or concerns.
              </p>
             </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Contact Form */}
               <Card className="p-6 card-cyber">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                       className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                       className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                       className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Your Message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                       className="bg-muted/50"
                    />
                  </div>
                   <Button type="submit" className="w-full btn-cyber">
                     <Send className="mr-2 h-4 w-4" />
                     Send Message
                   </Button>
                </form>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                 <Card className="p-6 card-cyber">
                  <div className="flex items-start gap-4">
                     <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Visit Us</h3>
                      <p className="text-muted-foreground">
                        Nairobi, Kenya<br />
                        City Center
                      </p>
                    </div>
                  </div>
                </Card>

                 <Card className="p-6 card-cyber">
                  <div className="flex items-start gap-4">
                     <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <p className="text-muted-foreground">
                        +254 700 000 000<br />
                        Mon-Sat 9AM-6PM
                      </p>
                    </div>
                  </div>
                </Card>

                 <Card className="p-6 card-cyber">
                  <div className="flex items-start gap-4">
                     <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email Us</h3>
                      <p className="text-muted-foreground">
                         hello@urbansoko.co.ke<br />
                         support@urbansoko.co.ke
                      </p>
                    </div>
                  </div>
                </Card>

                 <Card className="p-6 card-cyber">
                  <div className="flex items-start gap-4">
                     <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9AM - 6PM<br />
                        Saturday: 10AM - 4PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
