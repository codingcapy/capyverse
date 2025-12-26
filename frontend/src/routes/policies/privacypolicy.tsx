import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/privacypolicy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pt-[88px] px-2 md:px-0 mx-auto w-full md:w-[50%] 2xl:w-[40%] pb-20">
      <h1 className="text-3xl">Privacy Policy for Capyverse</h1>
      <p className="my-3">Effective date: December 26, 2025</p>
      <p className="my-3">
        Capyverse (“we”, “our”, or “us”) operates a social platform application
        similar in structure and functionality to community-based discussion
        platforms. Your privacy is important to us, and this Privacy Policy
        explains what information we collect, how we use it, and how it is
        shared.
      </p>
      <p className="my-3">
        By using Capyverse, you agree to the collection and use of information
        in accordance with this policy.
      </p>
      <h2 className="text-2xl my-3">1. Information We Collect</h2>
      <h3 className="text-xl my-3">1.1 Account Information</h3>
      <p className="my-3">
        When you create an account, we collect information necessary for
        authentication and basic account functionality, such as:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>A unique user identifier</li>
        <li>Login credentials or authentication data</li>
        <li>
          Profile information you choose to provide (such as a username or
          profile image)
        </li>
      </ul>
      <p className="my-3">
        Profile images are used solely to visually represent your account.
      </p>
      <h3 className="text-xl my-3">1.2 Content You Create</h3>
      <p className="my-3">
        We collect the content you submit to Capyverse, including:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>Posts</li>
        <li>Comments</li>
        <li>Community participation data (e.g., which communities you join)</li>
      </ul>
      <p className="my-3">
        Unless explicitly marked as private or limited in visibility, posts and
        comments are publicly accessible, including to users who are not logged
        in.
      </p>
      <h3 className="text-xl my-3">1.3 Usage & Community Data</h3>
      <p className="my-3">We store information needed to:</p>
      <ul className="list-disc pl-10 my-3">
        <li>Associate posts and comments with their authors</li>
        <li>Determine which communities you belong to</li>
        <li>
          Filter and display content relevant to your selected communities
        </li>
      </ul>
      <p className="my-3">
        This data is used only for core application functionality.
      </p>
      <h2 className="text-2xl my-3">2. How We Use Your Information</h2>
      <p className="my-3">
        We use collected data only for the following purposes:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>Authenticating users</li>
        <li>Operating core platform features</li>
        <li>Associating users with their posts and comments</li>
        <li>Displaying and filtering content based on community membership</li>
        <li>Maintaining platform integrity and basic moderation</li>
      </ul>
      <p className="my-3">
        We do not use your data for advertising, behavioral tracking, or
        profiling beyond what is required for platform functionality.
      </p>
      <h2 className="text-2xl my-3">3. Public Content</h2>
      <p className="my-3">Please note:</p>
      <ul className="list-disc pl-10 my-3">
        <li>
          Public posts and comments may be viewed by anyone, including
          non-registered users.
        </li>
        <li>
          Content you choose to make private or limited will only be visible
          according to those settings.
        </li>
      </ul>
      <p className="my-3">
        You are responsible for any information you choose to share publicly.
      </p>
      <h2 className="text-2xl my-3">4. Data Sharing</h2>
      <p className="my-3">We do not sell or rent your personal data.</p>
      <p className="my-3">
        We only share information in the following limited cases:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>When required by law or valid legal process</li>
        <li>
          To protect the rights, safety, or security of Capyverse or its users
        </li>
        <li>
          With service providers strictly necessary to operate the platform
          (e.g., hosting or storage providers), under confidentiality
          obligations
        </li>
      </ul>
      <h2 className="text-2xl my-3">5. Data Storage and Security</h2>
      <p className="my-3">
        We take reasonable technical and organizational measures to protect your
        data from unauthorized access, loss, or misuse. However, no system is
        100% secure, and we cannot guarantee absolute security.
      </p>
      <h2 className="text-2xl my-3">6. Data Retention</h2>
      <p className="my-3">
        We retain data only for as long as necessary to provide the service:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>Account data is retained while your account is active</li>
        <li>
          Content remains stored unless deleted by you or required to be removed
        </li>
      </ul>
      <p className="my-3">
        Deleted data may persist for a limited time in backups.
      </p>
      <h2 className="text-2xl my-3">7. Your Rights</h2>
      <p className="my-3">
        Depending on your jurisdiction, you may have the right to:
      </p>
      <ul className="list-disc pl-10 my-3">
        <li>Access your personal data</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion of your account and associated data</li>
      </ul>
      <p className="my-3">
        You can exercise these rights through the app or by contacting us.
      </p>
      <h2 className="text-2xl my-3">8. Children’s Privacy</h2>
      <p className="my-3">
        Capyverse is not intended for use by children under the age required by
        applicable law. We do not knowingly collect personal data from children.
      </p>
      <h2 className="text-2xl my-3">9. Changes to This Policy</h2>
      <p className="my-3">
        We may update this Privacy Policy from time to time. Changes will be
        effective when posted. Continued use of Capyverse after changes
        constitutes acceptance of the updated policy.
      </p>
    </div>
  );
}
