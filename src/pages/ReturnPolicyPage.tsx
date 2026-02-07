import { RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const ReturnPolicyPage = () => {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <RotateCcw className="h-4 w-4" />
              Returns
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Return & Refund Policy</h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Return Window</h2>
            <p className="text-muted-foreground mb-4">
              You have 14 days from the date of delivery to return most items for a full refund. Custom-made or personalized items cannot be returned unless defective.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Return Conditions</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Be unused and in the same condition as received</li>
              <li>Have all original tags and packaging</li>
              <li>Include proof of purchase (receipt or order number)</li>
              <li>Not be worn, washed, or altered in any way</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Non-Returnable Items</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>Custom-made or personalized products</li>
              <li>Items marked as final sale</li>
              <li>Underwear and intimate apparel (for hygiene reasons)</li>
              <li>Opened electronics and appliances (unless defective)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. How to Return</h2>
            <ol className="list-decimal pl-6 text-muted-foreground mb-4">
              <li>Contact our customer service at support@urbansoko.co.ke with your order number</li>
              <li>Wait for return authorization and instructions</li>
              <li>Pack the item securely with all original materials</li>
              <li>Ship the item to the provided return address</li>
            </ol>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Refund Process</h2>
            <ul className="list-disc pl-6 text-muted-foreground mb-4">
              <li>We'll send you an email confirming receipt</li>
              <li>If approved, your refund will be processed within 5-7 business days</li>
              <li>Refunds are issued to the original payment method</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact</h2>
            <p className="text-muted-foreground">
              For questions about returns, contact us at support@urbansoko.co.ke or call +254 700 000 000
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnPolicyPage;
