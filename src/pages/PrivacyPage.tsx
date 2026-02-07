import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Name, email address, phone number, and shipping address</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Order history and preferences</li>
              <li>Communications with our customer service team</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send you promotional materials (with your consent)</li>
              <li>Improve our products and services</li>
              <li>Detect and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">We do not sell your personal information. We may share with vendors, payment processors, and shipping partners as needed to fulfill orders.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">We implement appropriate security measures to protect your personal information.</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us at privacy@urbansoko.co.ke</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
