import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card } from '@/components/ui/card';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

const ShippingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Shipping Information</h1>
              <p className="text-lg text-muted-foreground">
                Fast and reliable delivery across Kenya
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Shipping Methods */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Shipping Methods</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">
                      <Truck className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Standard Delivery</h3>
                      <p className="text-muted-foreground mb-2">
                        3-7 business days for nationwide delivery
                      </p>
                      <p className="text-sm text-primary font-medium">KES 200 - 500</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">
                      <Package className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Express Delivery</h3>
                      <p className="text-muted-foreground mb-2">
                        1-3 business days within Nairobi
                      </p>
                      <p className="text-sm text-primary font-medium">KES 500 - 800</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Delivery Timeline</h2>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Nairobi & Surrounding Areas</h3>
                      <p className="text-muted-foreground">1-3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Major Cities (Mombasa, Kisumu, Nakuru)</h3>
                      <p className="text-muted-foreground">3-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Other Regions</h3>
                      <p className="text-muted-foreground">5-7 business days</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Shipping Costs */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Shipping Costs</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-4">
                  Shipping costs are calculated based on:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Delivery location</li>
                  <li>Order weight and size</li>
                  <li>Selected shipping method</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  <strong>Free Shipping:</strong> Orders over KES 5,000 qualify for free standard shipping 
                  within Nairobi!
                </p>
              </div>
            </div>

            {/* Order Tracking */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">Track Your Order</h3>
                    <p className="text-muted-foreground mb-4">
                      Once your order ships, you'll receive a tracking code via email and SMS. Use this code 
                      on our Order Tracking page to monitor your delivery in real-time.
                    </p>
                    <a href="/order-tracking" className="text-primary hover:underline font-medium">
                      Track Order →
                    </a>
                  </div>
                </div>
              </Card>
            </div>

            {/* Important Notes */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Important Notes</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Orders are processed Monday through Friday, excluding public holidays</li>
                <li>Order processing takes 1-2 business days before shipping</li>
                <li>Delivery times are estimates and may vary during peak seasons</li>
                <li>Someone must be available to receive and sign for deliveries</li>
                <li>We'll contact you if there are any delivery issues</li>
              </ul>
            </div>

            <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Questions about shipping?</h3>
              <p className="text-muted-foreground mb-4">
                Contact our customer support team for assistance
              </p>
              <a href="/contact" className="text-primary hover:underline font-medium">
                Contact Support →
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingPage;
