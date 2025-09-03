import Link from "next/link";

export default function TermsPage() {
  return (
    <>
      <TermsHeroSection />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
      
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold mb-4">Agreement between User and The Piped Peony, LLC.</h2>
        
        <p className="mb-4">
          Welcome to The Piped Peony Academy (the "Academy.") The Academy website (the "Site") is comprised of various web pages operated by The Piped Peony ("The Piped Peony"). The Academy is offered to you conditioned on your acceptance without modification of the terms, conditions, and notices contained herein (the "Terms"). Your use of the Academy's Site constitutes your agreement to all such Terms. Please read these terms carefully, and keep a copy of them for your reference.
        </p>

        <p className="mb-6">The Academy is an E-Commerce Site.</p>

        <h3 className="text-xl font-semibold mb-3">Subscription Terms</h3>
        <p className="mb-4">
          The website offers 30-day memberships for subscribers to receive decorative culinary tutorials and other related-content, in exchange for a monthly automatically renewing fee of $15.00. After signing up and unless otherwise cancelled, monthly billings will occur after a 7-day trial period, and will continue via automatic and recurring billing every 30-days to the original payment method. Upon cancellation, access to the Academy will cease immediately. No refunds will be issued unless otherwise specified. If you have questions about the billing policy of the Academy, please contact: dara@pipedpeony3.wpenginepowered.com.
        </p>

        <h3 className="text-xl font-semibold mb-3">Results</h3>
        <p className="mb-4">
          The Piped Peony Academy does not guarantee results of any kind. Improvement of skills are driven heavily by the amount of practice and effort a member contributes towards the achievement of their individual goals, specific to flower piping and cake decorating.
        </p>

        <h3 className="text-xl font-semibold mb-3">Cancellation Terms</h3>
        <p className="mb-4">
          Members of The Piped Peony Academy can cancel their membership at any time. Cancellations will take place prior to the next billing cycle, so long as the member has attempted to cancel prior to the next billing cycle. To cancel a membership, a member must log in to their respective account, and cancel online through their customer portal. Questions regarding billing and cancellations should be sent to The Piped Peony through the Site's contact form, Contact – The Piped Peony.
        </p>
        
        <p className="mb-4">
          Cancellation requests through social media platforms, or any other indirect methods of contact, will not be accepted.
        </p>

        <h3 className="text-xl font-semibold mb-3">Free Trials</h3>
        <p className="mb-4">
          The website also offers a free 7-day trial, that The Piped Peony can cancel anytime. Members will be billed each month, without notice of billing. Members can cancel anytime through their membership portal. The website also sells various cake decorating supplies. The website sells piping tip kits that are tuned and untuned. The website also sells piping blocks. Return of piping tip kits is not allowed. All sales are final.
        </p>

        <h3 className="text-xl font-semibold mb-3">Membership Use & Sharing Accounts</h3>
        <p className="mb-4">
          Memberships are not to be shared with anyone outside of a residential household. Commercial users will need separate accounts for any employees participating in The Piped Peony Academy; sharing a membership among employees, or outside of a residential household, will result in immediate cancellation of said membership, without a refund being issued. Further, any person(s) determined to be sharing a membership, will be unable to rejoin as a member to The Piped Peony Academy.
        </p>

        <h3 className="text-xl font-semibold mb-3">Electronic Communications</h3>
        <p className="mb-4">
          Visiting The Academy or sending emails to The Piped Peony constitutes electronic communications. You consent to receive electronic communications and you agree that all agreements, notices, disclosures and other communications that we provide to you electronically, via email and on the Site, satisfy any legal requirement that such communications be in writing.
        </p>

        <h3 className="text-xl font-semibold mb-3">Your Account</h3>
        <p className="mb-4">
          If you use this site, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password. You may not assign or otherwise transfer your account to any other person or entity. You acknowledge that The Piped Peony is not responsible for third party access to your account that results from theft or misappropriation of your account. The Piped Peony and its associates reserve the right to refuse or cancel service, terminate accounts, or remove or edit content in our sole discretion.
        </p>

        <h3 className="text-xl font-semibold mb-3">Children Under Thirteen</h3>
        <p className="mb-4">
          The Piped Peony does not knowingly collect, either online or offline, personal information from persons under the age of thirteen. If you are under 18, you may use The Academy only with permission of a parent or guardian.
        </p>

        <h3 className="text-xl font-semibold mb-3">Links to Third Party Sites/Third Party Services</h3>
        <p className="mb-4">
          The Academy may contain links to other websites ("Linked Sites"). The Linked Sites are not under the control of The Piped Peony and The Piped Peony is not responsible for the contents of any Linked Site, including without limitation any link contained in a Linked Site, or any changes or updates to a Linked Site. The Piped Peony is providing these links to you only as a convenience, and the inclusion of any link does not imply endorsement by The Piped Peony of the site or any association with its operators.
        </p>

        <p className="mb-4">
          Certain services made available via the Academy are delivered by third party sites and organizations. By using any product, service or functionality originating from the Academy domain, you hereby acknowledge and consent that The Piped Peony may share such information and data with any third party with whom The Piped Peony has a contractual relationship to provide the requested product, service or functionality on behalf of the Academy's users and customers.
        </p>

        <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
        <p className="mb-4">
          The Piped Peony welcomes your questions or comments regarding the Terms. If you have any questions or concerns, please email dara@pipedpeony3.wpenginepowered.com.
        </p>

        <p className="text-sm text-gray-600 mt-8">
          Effective as of March 21, 2022
        </p>
      </div>
      </div>
    </>
  );
}

function TermsHeroSection() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <Link href="/" className="text-[#D4A771] hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="hero-title text-center">
            Terms & Conditions
          </h1>
        </div>
      </div>
    </section>
  );
}
