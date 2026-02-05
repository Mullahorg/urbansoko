import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
 import { FileText, Hexagon } from 'lucide-react';
 import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
         <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 overflow-hidden">
           <div className="absolute inset-0 hex-pattern opacity-20" />
          <div className="container mx-auto px-4">
             <motion.div 
               className="max-w-3xl mx-auto text-center relative z-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                 <FileText className="h-4 w-4" />
                 Legal
               </div>
               <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
             </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                 By accessing and using UrbanSoko's website and services, you accept and agree to be bound 
                by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
              <p className="text-muted-foreground mb-4">
                You agree to use our service only for lawful purposes and in accordance with these Terms. You agree 
                not to use the service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any harmful or malicious code</li>
                 <li>To impersonate or attempt to impersonate UrbanSoko or any other person</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use of the service</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration</h2>
              <p className="text-muted-foreground mb-4">
                To access certain features, you may be required to register for an account. You agree to provide 
                accurate, current, and complete information during registration and to update such information to 
                keep it accurate and current.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Orders and Payment</h2>
              <p className="text-muted-foreground mb-4">
                All orders are subject to acceptance and availability. We reserve the right to refuse any order. 
                Prices are subject to change without notice. Payment must be received before order processing.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Vendor Terms</h2>
              <p className="text-muted-foreground mb-4">
                 Vendors must comply with all applicable laws and our vendor policies. UrbanSoko reserves 
                the right to remove any vendor or product listing that violates our terms or policies.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on this website, including text, graphics, logos, and images, is the property of 
                 UrbanSoko or its content suppliers and is protected by copyright and intellectual property laws.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                 UrbanSoko shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of or inability to use the service.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. Continued use of the service after changes 
                constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
              <p className="text-muted-foreground">
                 For questions about these Terms, please contact us at legal@urbansoko.co.ke
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
