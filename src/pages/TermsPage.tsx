import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">Terms of Service</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using Male Afrique Wear's website and services, you accept and agree to be bound 
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
                <li>To impersonate or attempt to impersonate Male Afrique Wear or any other person</li>
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
                Vendors must comply with all applicable laws and our vendor policies. Male Afrique Wear reserves 
                the right to remove any vendor or product listing that violates our terms or policies.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on this website, including text, graphics, logos, and images, is the property of 
                Male Afrique Wear or its content suppliers and is protected by copyright and intellectual property laws.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                Male Afrique Wear shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of or inability to use the service.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. Continued use of the service after changes 
                constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms, please contact us at info@maleafrique.com
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
