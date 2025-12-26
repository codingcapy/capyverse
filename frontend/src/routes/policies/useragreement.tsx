import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/useragreement")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pt-[88px] px-2 md:px-0 mx-auto w-full md:w-[50%] 2xl:w-[40%] pb-20">
      <h1 className="text-3xl">Capyverse User Agreement (Terms of Service)</h1>
      <p className="my-3">Effective date: December 26, 2025</p>
      <p className="my-3">
        Welcome to Capyverse. This User Agreement (“Agreement”) governs your
        access to and use of the Capyverse application and related services
        (“Capyverse”, “we”, “us”, or “our”).
      </p>
      <p className="my-3">
        By accessing or using Capyverse, you agree to be bound by this
        Agreement. If you do not agree, you may not use the service.
      </p>
      <h2 className="text-2xl my-3">1. Eligibility</h2>
      <p className="my-3">
        You may use Capyverse only if you are legally permitted to do so under
        applicable laws. By using the service, you represent that you meet any
        applicable age or legal requirements in your jurisdiction.
      </p>
      <h2 className="text-2xl my-3">2. Your Account</h2>
      <h3 className="text-xl my-3">2.1 Account Creation</h3>
      <p className="my-3">
        To access certain features, you must create an account. You agree to:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>Provide accurate and current information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Be responsible for all activity that occurs under your account</li>
      </ul>
      <p className="my-3">
        You are responsible for safeguarding your account and notifying us of
        any unauthorized access.
      </p>
      <h3 className="text-xl my-3">2.2 Account Termination</h3>
      <p className="my-3">
        You may delete your account at any time. We reserve the right to suspend
        or terminate accounts that violate this Agreement or applicable laws.
      </p>
      <h2 className="text-2xl my-3">3. Content on Capyverse</h2>
      <h3 className="text-xl my-3">3.1 User Content</h3>
      <p className="my-3">
        You retain ownership of the content you submit, post, or upload (“User
        Content”), including posts, comments, and images.
      </p>
      <p className="my-3">
        By submitting User Content, you grant Capyverse a non-exclusive,
        royalty-free, worldwide license to host, store, display, and distribute
        that content solely for the purpose of operating and providing the
        service.
      </p>
      <h3 className="text-xl my-3">3.2 Public and Private Content</h3>
      <ul className="list-disc pl-10 my-3">
        <li>
          Content that is not explicitly marked as private or limited is public
          and may be viewed by anyone, including non-registered users.
        </li>
        <li>
          You are responsible for choosing appropriate visibility settings for
          your content.
        </li>
      </ul>
      <h3 className="text-xl my-3">3.3 Content Responsibility</h3>
      <p className="my-3">
        You are solely responsible for the content you post. You agree not to
        submit content that:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>Is illegal or unlawful</li>
        <li>Infringes on intellectual property or other rights</li>
        <li>Is malicious, abusive, or harmful</li>
        <li>Attempts to exploit or disrupt the platform or other users</li>
      </ul>
      <p className="my-3">
        We reserve the right (but are not obligated) to remove content that
        violates this Agreement.
      </p>
      <h2 className="text-2xl my-3">4. Community Participation</h2>
      <p className="my-3">
        Capyverse is organized around user-created communities. Community rules
        may exist in addition to this Agreement. Participation in a community
        implies agreement to follow its rules.
      </p>
      <p className="my-3">
        Capyverse may take action to enforce platform-wide standards to maintain
        safety and integrity.
      </p>
      <h2 className="text-2xl my-3">5. Acceptable Use</h2>
      <p className="my-3">You agree not to:</p>
      <ul className="list-disc pl-10 my-3">
        <li>Attempt to access accounts or data you do not own</li>
        <li>Interfere with or disrupt the service</li>
        <li>
          Scrape, reverse engineer, or exploit the platform without permission
        </li>
        <li>Use Capyverse for spam, harassment, or abuse</li>
      </ul>
      <h2 className="text-2xl my-3">6. Intellectual Property</h2>
      <p className="my-3">
        The Capyverse application, including its design, code, branding, and
        features, is owned by Capyverse and protected by intellectual property
        laws.
      </p>
      <p className="my-3">
        You may not copy, modify, or distribute any part of the service without
        permission, except as allowed by law.
      </p>
      <h2 className="text-2xl my-3">7. Service Availability</h2>
      <p className="my-3">
        Capyverse is provided “as is” and “as available.” We do not guarantee
        uninterrupted or error-free service and may modify or discontinue
        features at any time.
      </p>
      <h2 className="text-2xl my-3">8. Disclaimers</h2>
      <p className="my-3">
        Capyverse does not endorse user-generated content and is not responsible
        for content posted by users.
      </p>
      <p className="my-3">
        Use of the service is at your own risk. To the maximum extent permitted
        by law, Capyverse disclaims all warranties, express or implied.
      </p>
      <h2 className="text-2xl my-3">9. Limitation of Liability</h2>
      <p className="my-3">
        To the extent permitted by law, Capyverse will not be liable for
        indirect, incidental, or consequential damages arising from your use of
        the service.
      </p>
      <h2 className="text-2xl my-3">10. Changes to This Agreement</h2>
      <p className="my-3">
        We may update this Agreement from time to time. Changes take effect when
        posted. Continued use of Capyverse constitutes acceptance of the updated
        Agreement.
      </p>
      <h2 className="text-2xl my-3">11. Governing Law</h2>
      <p className="my-3">
        This Agreement is governed by the laws applicable in the jurisdiction
        where Capyverse operates, without regard to conflict-of-law principles.
      </p>
    </div>
  );
}
