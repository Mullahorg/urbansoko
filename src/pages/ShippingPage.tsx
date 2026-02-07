import { Card } from '@/components/ui/card';
import { Truck, Clock, MapPin, Rocket, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const ShippingPage = () => {
  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Rocket className="h-4 w-4" />
              Fast Delivery
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Shipping Information</h1>
            <p className="text-lg text-muted-foreground">Fast and reliable delivery across Kenya</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Shipping Methods</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 card-cyber">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Standard Delivery</h3>
                    <p className="text-muted-foreground mb-2">3-7 business days nationwide</p>
                    <p className="text-sm text-primary font-medium">KES 200 - 500</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 card-cyber">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Express Delivery</h3>
                    <p className="text-muted-foreground mb-2">1-3 business days within Nairobi</p>
                    <p className="text-sm text-primary font-medium">KES 500 - 800</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Delivery Timeline</h2>
            <Card className="p-6 card-cyber">
              <div className="space-y-4">
                {[
                  { area: "Nairobi & Surrounding Areas", time: "1-3 business days" },
                  { area: "Major Cities (Mombasa, Kisumu, Nakuru)", time: "3-5 business days" },
                  { area: "Other Regions", time: "5-7 business days" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.area}</h3>
                      <p className="text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Order Tracking</h2>
            <Card className="p-6 card-cyber">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Track Your Order</h3>
                  <p className="text-muted-foreground mb-4">Once your order ships, you'll receive a tracking code via email and SMS.</p>
                  <a href="/track-order" className="text-primary hover:underline font-medium">Track Order →</a>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Questions about shipping?</h3>
            <p className="text-muted-foreground mb-4">Contact our customer support team</p>
            <a href="/contact" className="text-primary hover:underline font-medium">Contact Support →</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPage;
