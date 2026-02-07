import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
            <p className="text-muted-foreground mb-4">By accessing and using UrbanSoko's website and services, you accept and agree to be bound by these Terms of Service.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any harmful or malicious code</li>
              <li>To impersonate or attempt to impersonate UrbanSoko or any other person</li>
              <li>To engage in any conduct that restricts or inhibits anyone's use of the service</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Product Categories</h2>
            <p className="text-muted-foreground mb-4">UrbanSoko offers a variety of products including shoes, clothing, kitchen appliances, home appliances, and more. Product availability may vary.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Orders and Payment</h2>
            <p className="text-muted-foreground mb-4">All orders are subject to acceptance and availability. We reserve the right to refuse any order. Payment must be received before order processing.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Vendor Terms</h2>
            <p className="text-muted-foreground mb-4">Vendors must comply with all applicable laws and our vendor policies. UrbanSoko reserves the right to remove any vendor or product listing that violates our terms.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">All content on this website is the property of UrbanSoko or its content suppliers and is protected by copyright and intellectual property laws.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
            <p className="text-muted-foreground">For questions about these Terms, please contact us at legal@urbansoko.co.ke</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
