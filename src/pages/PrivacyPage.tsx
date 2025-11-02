import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center">Privacy Policy</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Name, email address, phone number, and shipping address</li>
                <li>Payment information (processed securely through our payment providers)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Send you promotional materials (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Detect and prevent fraud</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Vendors to fulfill your orders</li>
                <li>Payment processors to complete transactions</li>
                <li>Shipping partners to deliver your orders</li>
                <li>Service providers who assist our business operations</li>
                <li>Law enforcement when required by law</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate security measures to protect your personal information. However, no 
                method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to track activity on our service and hold 
                certain information. You can instruct your browser to refuse cookies, but some features may 
                not function properly.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our service is not intended for children under 13. We do not knowingly collect personal 
                information from children under 13.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at info@maleafrique.com
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
