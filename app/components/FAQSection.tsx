import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import StructuredData from "./StructuredData"
import faqData from "@/data/faq.json"

export default function FAQSection() {
  // Generate FAQ structured data for SEO
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <section className="section-padding bg-white">
      <StructuredData data={faqJsonLd} />

      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our beach and pool party equipment in Canggu
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-gray-50 rounded-lg px-6 border-none">
                <AccordionTrigger className="text-left font-display font-semibold text-lg text-charcoal hover:text-teal transition-colors py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-6 leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Still have questions? We're here to help!</p>
          <a
            href="https://wa.me/6285190459091?text=Hi! I have some questions about your beach and pool party equipment"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Ask Us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
