import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export function TermsOfService() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign Up
          </Button>
          <h1 className="mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using EduLearn ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these Terms of Service, you are not authorized to use or access this service.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              EduLearn is an educational platform that provides online courses, learning materials, and educational resources. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of our service, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information during registration</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2>4. User Content and Conduct</h2>
            <p>
              You are solely responsible for the content you submit, post, or display on the Platform. You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Upload or share content that is illegal, harmful, or offensive</li>
              <li>Violate any intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to the Platform</li>
              <li>Use the service for any commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            <p>
              All content on EduLearn, including but not limited to text, graphics, logos, images, audio clips, video clips, and software, is the property of EduLearn or its content suppliers and is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2>6. Payment and Subscriptions</h2>
            <p>
              Some features of our service require payment. By purchasing a subscription or making a payment:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to pay all fees associated with your subscription</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Refunds are subject to our refund policy</li>
              <li>We reserve the right to change pricing with notice</li>
            </ul>
          </section>

          <section>
            <h2>7. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          <section>
            <h2>8. Disclaimers</h2>
            <p>
              EduLearn is provided "as is" without any warranties, expressed or implied. We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The service will be uninterrupted or error-free</li>
              <li>The results obtained from the service will be accurate or reliable</li>
              <li>The quality of any courses or content will meet your expectations</li>
            </ul>
          </section>

          <section>
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall EduLearn be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses resulting from your use of the Platform.
            </p>
          </section>

          <section>
            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.
            </p>
          </section>

          <section>
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes through the Platform or via email. Your continued use of the Platform after any such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2>12. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction where EduLearn is headquartered, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Email:</strong> legal@edulearn.com</p>
              <p><strong>Address:</strong> EduLearn Legal Department<br />
                123 Education Street<br />
                Learning City, LC 12345
              </p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign Up
            </Button>
            <p className="text-sm text-muted-foreground">
              By using EduLearn, you agree to these terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}