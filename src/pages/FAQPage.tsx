import Header from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
 import { HelpCircle, Hexagon } from 'lucide-react';
 import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const faqs = [
    {
      category: "Orders & Payments",
      questions: [
        {
          q: "How do I place an order?",
          a: "Browse our products, add items to your cart, and proceed to checkout. You can checkout as a guest or create an account for faster future orders."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept M-Pesa mobile payments. Simply enter your phone number at checkout and approve the payment on your phone."
        },
        {
          q: "Can I cancel my order?",
           a: "Yes, you can cancel your order within 1 hour of placement. Contact us immediately at support@urbansoko.co.ke with your order number."
        },
        {
          q: "How do I track my order?",
          a: "Visit our Order Tracking page and enter your tracking code (sent via email) to see your order status in real-time."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping within Nairobi takes 1-3 business days. Other regions in Kenya take 3-7 business days."
        },
        {
          q: "Do you ship internationally?",
          a: "Currently, we only ship within Kenya. International shipping is coming soon."
        },
        {
          q: "What are the shipping costs?",
          a: "Shipping costs vary by location and order size. You'll see the exact cost at checkout before payment."
        }
      ]
    },
    {
      category: "Returns & Refunds",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 14-day return window for most items. Products must be unused, with original tags, and in their original packaging."
        },
        {
          q: "How do I return an item?",
           a: "Contact us at support@urbansoko.co.ke with your order number. We'll provide return instructions and authorization."
        },
        {
          q: "When will I receive my refund?",
          a: "Refunds are processed within 5-7 business days after we receive and inspect your return."
        }
      ]
    },
    {
      category: "Products & Sizing",
      questions: [
        {
          q: "How do I find my size?",
          a: "Each product page includes a size guide. If you're unsure, contact us for personalized sizing advice."
        },
        {
           q: "Are your products from verified vendors?",
           a: "Yes! All vendors on UrbanSoko are verified and vetted to ensure quality and authenticity."
        },
        {
          q: "Do you offer custom or bespoke items?",
          a: "Yes, select vendors offer custom tailoring. Look for the 'Custom Available' badge on product pages."
        }
      ]
    },
    {
      category: "Account & Rewards",
      questions: [
        {
          q: "How do I earn rewards points?",
          a: "Earn 1 point for every 100 KES spent. Points can be redeemed for discounts on future purchases."
        },
        {
          q: "How do I become a vendor?",
          a: "Visit our Vendor Registration page, fill out the application form, and our team will review your submission."
        },
        {
          q: "Can I save items for later?",
          a: "Yes! Create an account and use the wishlist feature to save your favorite items."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={0} />
      
      <main className="flex-1">
         <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 overflow-hidden">
           <div className="absolute inset-0 hex-pattern opacity-20" />
          <div className="container mx-auto px-4">
             <motion.div 
               className="max-w-3xl mx-auto text-center relative z-10"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                 <HelpCircle className="h-4 w-4" />
                 Help Center
               </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                 Find answers to common questions about shopping with UrbanSoko
              </p>
             </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {faqs.map((category, idx) => (
              <div key={idx} className="mb-12">
                <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
               <a href="/contact" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
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

export default FAQPage;
