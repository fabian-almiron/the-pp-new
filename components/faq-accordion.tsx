"use client"

import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const faqs = [
    {
      question: "Once you join, do you have to pay extra for each video?",
      answer: "No, your membership includes access to all current and future videos in the academy. There are no extra fees for standard content.",
    },
    {
      question: "Are the classes recorded?",
      answer: "Yes, all classes are pre-recorded and available on-demand, so you can watch them anytime, anywhere, and at your own pace.",
    },
    {
      question: "Can I see all the videos or just the new ones after I join?",
      answer: "Your membership gives you immediate access to our entire library of videos, including all past content and all new videos released during your membership.",
    },
    {
      question: "Do you do live classes?",
      answer: "We occasionally host live Q&A sessions and special events for members, but our core curriculum consists of pre-recorded video tutorials.",
    },
    {
      question: "What if I don't want to sign up monthly?",
      answer: "We offer both monthly and annual subscription plans. The annual plan provides a discount compared to the monthly rate.",
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className="text-left font-serif text-lg text-gray-800 hover:no-underline">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
