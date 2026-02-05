import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card } from '@/components/ui/card';
 import { Users, Target, Award, Heart, Hexagon, Cpu, Globe, Rocket } from 'lucide-react';
 import { motion } from 'framer-motion';

const AboutPage = () => {
  const values = [
    {
       icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community First",
       description: "We celebrate African innovation and empower local vendors across Kenya."
    },
    {
       icon: <Cpu className="h-8 w-8 text-primary" />,
       title: "Tech-Forward",
       description: "AI-powered recommendations and seamless M-Pesa integration for the modern shopper."
    },
    {
       icon: <Award className="h-8 w-8 text-primary" />,
      title: "Excellence",
      description: "We strive for excellence in every product and customer interaction."
    },
    {
       icon: <Globe className="h-8 w-8 text-primary" />,
       title: "African Pride",
       description: "Connecting African commerce to the future, one transaction at a time."
    }
  ];

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
                 <Hexagon className="h-4 w-4" />
                 About Us
               </div>
               <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-cyber">About UrbanSoko</h1>
              <p className="text-lg text-muted-foreground">
                 The Future of African Commerce
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
                   Kenya, we've built a next-generation marketplace that connects innovative vendors with 
                   modern consumers across the continent.
                </p>
                <p className="text-muted-foreground mb-4">
                   Our mission is to make commerce seamless, secure, and accessible. With AI-powered 
                   recommendations, instant M-Pesa payments, and same-day delivery, we're not just keeping 
                   up with the future—we're building it.
                </p>
                <p className="text-muted-foreground">
                   Every transaction on UrbanSoko supports local businesses and entrepreneurs, driving 
                   economic growth while delivering exceptional value to our customers.
                </p>
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
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
