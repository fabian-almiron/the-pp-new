import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link href="/" className="text-[#D4A771] hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-4 text-center">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-lg max-w-none">
        <p className="mb-4">
          <strong>Last updated:</strong> March 21, 2022
        </p>

        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          The Piped Peony, LLC ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including The Piped Peony Academy.
        </p>

        <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
        <p className="mb-4">
          We may collect information about you in a variety of ways. The information we may collect includes:
        </p>
        
        <h4 className="text-lg font-semibold mb-2">Personal Information</h4>
        <p className="mb-4">
          Personally identifiable information such as your name, email address, postal address, and telephone number that you voluntarily give to us when you register for an account, make a purchase, or correspond with us.
        </p>

        <h4 className="text-lg font-semibold mb-2">Payment Information</h4>
        <p className="mb-4">
          Financial information such as payment card numbers and billing addresses when you make purchases through our services.
        </p>

        <h3 className="text-xl font-semibold mb-3">How We Use Your Information</h3>
        <p className="mb-4">
          We may use the information we collect about you to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices and support messages</li>
          <li>Communicate with you about products, services, and events</li>
          <li>Monitor and analyze trends and usage</li>
          <li>Detect and prevent fraud and abuse</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Information Sharing</h3>
        <p className="mb-4">
          We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this Privacy Policy. We may share your information with:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Service providers who assist us in operating our website and services</li>
          <li>Payment processors to handle transactions</li>
          <li>Legal authorities when required by law or to protect our rights</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Data Security</h3>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
        </p>

        <h3 className="text-xl font-semibold mb-3">Your Rights</h3>
        <p className="mb-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access and update your personal information</li>
          <li>Delete your account and associated data</li>
          <li>Opt out of marketing communications</li>
          <li>Request information about how your data is used</li>
        </ul>

        <h3 className="text-xl font-semibold mb-3">Cookies and Tracking</h3>
        <p className="mb-4">
          Our website may use cookies and similar tracking technologies to enhance your experience. You can control cookie settings through your browser preferences.
        </p>

        <h3 className="text-xl font-semibold mb-3">Children's Privacy</h3>
        <p className="mb-4">
          Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
        </p>

        <h3 className="text-xl font-semibold mb-3">Changes to This Policy</h3>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mb-4">
          Email: dara@pipedpeony3.wpenginepowered.com
        </p>
      </div>
    </div>
  );
}
