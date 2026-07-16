import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const content = {
  privacy: {
    title: 'Privacy Policy',
    body: (
      <div className="space-y-6 text-gray-300">
        <p>At Stella Mobiles, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">1. Important Information and Who We Are</h3>
        <p>Stella Mobiles is the controller and responsible for your personal data. If you have any questions about this privacy policy, please contact us.</p>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">2. The Data We Collect About You</h3>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
          <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
          <li><strong>Financial Data</strong> includes payment card details (processed securely via our payment gateways).</li>
          <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
        </ul>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">3. How We Use Your Personal Data</h3>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances: Where we need to perform the contract we are about to enter into or have entered into with you. Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</p>
      </div>
    )
  },
  terms: {
    title: 'Terms of Service',
    body: (
      <div className="space-y-6 text-gray-300">
        <p>Welcome to Stella Mobiles. These terms and conditions outline the rules and regulations for the use of Stella Mobiles's Website.</p>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">1. License</h3>
        <p>Unless otherwise stated, Stella Mobiles and/or its licensors own the intellectual property rights for all material on Stella Mobiles. All intellectual property rights are reserved. You may access this from Stella Mobiles for your own personal use subjected to restrictions set in these terms and conditions.</p>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Restrictions</h3>
        <p>You are specifically restricted from all of the following:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>publishing any Website material in any other media;</li>
          <li>selling, sublicensing and/or otherwise commercializing any Website material;</li>
          <li>using this Website in any way that is or may be damaging to this Website;</li>
          <li>using this Website contrary to applicable laws and regulations.</li>
        </ul>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">3. No Warranties</h3>
        <p>This Website is provided "as is," with all faults, and Stella Mobiles express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.</p>
      </div>
    )
  },
  warranty: {
    title: 'Product Warranty',
    body: (
      <div className="space-y-6 text-gray-300">
        <p>At Stella Mobiles, we stand behind the quality of the products we sell. The product warranty is provided directly by the respective manufacturers.</p>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">1. Manufacturer Warranty</h3>
        <p>All products sold on Stella Mobiles come with a standard manufacturer's warranty. The duration and terms of the warranty vary by brand and product category. Typically, smartphones come with a 1-year manufacturer warranty for the device and 6 months for in-box accessories.</p>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Claiming Warranty</h3>
        <p>To claim warranty for a defective product, you can:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Visit any authorized service center of the respective brand with your original invoice.</li>
          <li>Contact our support team, and we will guide you to the nearest authorized service center.</li>
          <li>For select premium products, we offer an assisted warranty claim service where we pick up the device and coordinate with the service center on your behalf.</li>
        </ul>
        <h3 className="text-xl font-bold text-white mt-8 mb-4">3. What is Not Covered</h3>
        <p>The manufacturer's warranty typically does not cover:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Physical damage or liquid damage.</li>
          <li>Normal wear and tear.</li>
          <li>Unauthorized repairs or modifications.</li>
          <li>Accessories not included in the original box.</li>
        </ul>
      </div>
    )
  },
  return_policy: {
    title: 'Return Policy',
    body: (
      <div className="space-y-6 text-gray-300">
        <p>At Stella Hi Tech Private Limited, customer satisfaction is our priority. Returns are accepted only for products that are received damaged, defective, incorrect, or with missing items. Customers must notify us within <strong>48 hours</strong> of delivery by providing the order details along with clear photos or videos of the issue. Products must be returned unused, in their original condition, with all accessories, manuals, packaging, and the original tax invoice.</p>
        
        <h3 className="text-xl font-bold text-white mt-8 mb-4">1. Non-Returnable Conditions</h3>
        <p>Returns will not be accepted for products that have been activated, physically damaged after delivery, misused, altered, or damaged due to improper handling by the customer.</p>
        
        <h3 className="text-xl font-bold text-white mt-8 mb-4">2. Manufacturer Warranty</h3>
        <p>Mobile phones, tablets, smartwatches, and other electronic devices are covered by the respective manufacturer's warranty, and warranty-related issues must be addressed through the authorized service center unless otherwise required by applicable law.</p>

        <h3 className="text-xl font-bold text-white mt-8 mb-4">3. Inspection and Refunds</h3>
        <p>Stella Hi Tech Private Limited reserves the right to inspect the returned product before approving any replacement or refund. Once approved, refunds will be processed to the original payment method within 5-7 business days.</p>
      </div>
    )
  }
};

export default function LegalPage({ type }) {
  const data = content[type];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-stella-black pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center text-stella-red text-sm font-bold uppercase tracking-widest hover:text-white transition-colors mb-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-white mb-12">{data.title}</h1>
        <div className="bg-[#0d0d10] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
          {data.body}
        </div>
      </div>
    </div>
  );
}
