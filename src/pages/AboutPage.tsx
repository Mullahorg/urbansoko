import { Card } from '@/components/ui/card';
import { Users, Award, Cpu, Globe, Hexagon, ShoppingBag, Shirt, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const values = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community First",
      description: "We empower local vendors and connect them with customers across Kenya."
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "Tech-Forward",
      description: "AI-powered recommendations and seamless M-Pesa integration for the modern shopper."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Quality Products",
      description: "From shoes and clothing to kitchen and home appliances — only verified vendors."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "African Pride",
      description: "Connecting African commerce to the future, one transaction at a time."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 hex-pattern opacity-20" />
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Hexagon className="h-4 w-4" />
              About Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-cyber">About UrbanSoko</h1>
            <p className="text-lg text-muted-foreground">
              Your One-Stop Shop for Fashion, Footwear & Home Essentials
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-4">
                UrbanSoko was born from a vision to revolutionize e-commerce in Africa. Founded in Nairobi, 
                Kenya, we've built a next-generation marketplace specializing in shoes, clothing, kitchen 
                appliances, and home essentials.
              </p>
              <p className="text-muted-foreground mb-4">
                Our mission is to make shopping seamless, secure, and accessible. With AI-powered 
                recommendations, instant M-Pesa payments, and fast delivery, we connect you with 
                the best products from verified vendors across the country.
              </p>
              <p className="text-muted-foreground">
                Every purchase on UrbanSoko supports local businesses and entrepreneurs, driving 
                economic growth while delivering exceptional value to our customers.
              </p>
            </div>

            {/* Category Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[
                { icon: Shirt, label: "Fashion & Clothing" },
                { icon: ShoppingBag, label: "Shoes & Footwear" },
                { icon: Home, label: "Home Appliances" },
                { icon: Cpu, label: "Kitchen Essentials" },
              ].map((cat, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50">
                  <cat.icon className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="p-6 card-cyber h-full">
                    <div className="mb-4 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
