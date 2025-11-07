import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility Statement | The Piped Peony",
  description: "The Piped Peony is committed to ensuring digital accessibility for people with disabilities.",
};

export default function AccessibilityPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8">
          Accessibility Statement
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Our Commitment</h2>
          <p className="text-gray-700 mb-4">
            The Piped Peony is committed to ensuring digital accessibility for people with disabilities. 
            We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Conformance Status</h2>
          <p className="text-gray-700 mb-4">
            The <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-[#D4A771] underline">
            Web Content Accessibility Guidelines (WCAG)</a> defines requirements for designers and developers to improve 
            accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
          </p>
          <p className="text-gray-700 mb-4">
            The Piped Peony website is partially conformant with WCAG 2.1 level AA. 
            Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Measures to Support Accessibility</h2>
          <p className="text-gray-700 mb-4">
            The Piped Peony takes the following measures to ensure accessibility:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Include accessibility as part of our mission statement</li>
            <li>Integrate accessibility into our procurement practices</li>
            <li>Provide continual accessibility training for our staff</li>
            <li>Employ formal accessibility quality assurance methods</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Feedback</h2>
          <p className="text-gray-700 mb-4">
            We welcome your feedback on the accessibility of The Piped Peony website. 
            Please let us know if you encounter accessibility barriers:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Email: <a href="mailto:support@thepipedpeony.com" className="text-[#D4A771] underline">support@thepipedpeony.com</a></li>
            <li>Contact Form: <Link href="/contact" className="text-[#D4A771] underline">Contact Us</Link></li>
          </ul>
          <p className="text-gray-700 mb-4">
            We try to respond to feedback within 5 business days.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Technical Specifications</h2>
          <p className="text-gray-700 mb-4">
            Accessibility of The Piped Peony website relies on the following technologies to work with 
            the particular combination of web browser and any assistive technologies or plugins installed on your computer:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>HTML</li>
            <li>CSS</li>
            <li>JavaScript</li>
            <li>WAI-ARIA</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Limitations and Alternatives</h2>
          <p className="text-gray-700 mb-4">
            Despite our best efforts to ensure accessibility of The Piped Peony website, 
            there may be some limitations. Below is a description of known limitations and potential solutions:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li><strong>Video content:</strong> Some videos may lack captions. We are working to add captions to all video content. 
            Please <Link href="/contact" className="text-[#D4A771] underline">contact us</Link> if you need assistance with specific videos.</li>
            <li><strong>Third-party content:</strong> Some content is provided by third parties and may not be fully accessible. 
            We are working with our partners to improve accessibility.</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Assessment Approach</h2>
          <p className="text-gray-700 mb-4">
            The Piped Peony assessed the accessibility of this website by the following approaches:
          </p>
          <ul className="list-disc pl-6 mb-6 text-gray-700">
            <li>Self-evaluation</li>
            <li>Automated testing tools</li>
          </ul>

          <h2 className="text-2xl font-serif text-gray-900 mt-8 mb-4">Formal Approval</h2>
          <p className="text-gray-700 mb-4">
            This Accessibility Statement is approved by The Piped Peony management team.
          </p>

          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              This statement was created on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} using the 
              <a href="https://www.w3.org/WAI/planning/statements/" target="_blank" rel="noopener noreferrer" className="text-[#D4A771] underline ml-1">
                W3C Accessibility Statement Generator Tool
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

