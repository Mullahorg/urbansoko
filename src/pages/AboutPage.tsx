import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Card } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community First",
      description: "We celebrate African culture and empower local artisans and designers."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Quality Craftsmanship",
      description: "Each piece is carefully crafted with attention to detail and authenticity."
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Excellence",
      description: "We strive for excellence in every product and customer interaction."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Passion",
      description: "Our passion for African fashion drives everything we do."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Male Afrique Wear</h1>
              <p className="text-lg text-muted-foreground">
                Celebrating African heritage through contemporary fashion
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-4">
                  Male Afrique Wear was born from a passion to showcase the rich tapestry of African fashion 
                  to the world. Founded in Nairobi, Kenya, we've grown from a small boutique to a thriving 
                  marketplace that connects talented African designers with fashion enthusiasts globally.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our mission is to preserve and promote African cultural heritage through contemporary fashion. 
                  We work directly with local artisans, designers, and vendors to bring you authentic pieces 
                  that tell a story.
                </p>
                <p className="text-muted-foreground">
                  Every purchase you make supports African creativity and craftsmanship, helping to sustain 
                  traditional techniques while embracing modern design innovations.
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
                  <Card key={index} className="p-6">
                    <div className="text-primary mb-4">{value.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </Card>
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
