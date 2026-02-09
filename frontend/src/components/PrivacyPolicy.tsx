import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PrivacyPolicyProps {
  onNavigate?: (page: string) => void;
}

export function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.('home')}
            className="mb-4 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: December 2024
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to EduLearn ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, process, and protect your information when you use our educational platform and services.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>We collect information you directly provide to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account registration information (name, email address, password)</li>
              <li>Profile information (bio, educational background, preferences)</li>
              <li>Course enrollment and progress data</li>
              <li>Communications with us (support requests, feedback)</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>User-generated content (assignments, discussions, reviews)</li>
            </ul>

            <h3>2.2 Information Automatically Collected</h3>
            <p>When you use our platform, we automatically collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Log files and technical data for security and performance</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing and maintaining our educational services</li>
              <li>Processing enrollments and managing your account</li>
              <li>Personalizing your learning experience and recommendations</li>
              <li>Communicating with you about courses, updates, and support</li>
              <li>Processing payments and managing subscriptions</li>
              <li>Analyzing usage patterns to improve our platform</li>
              <li>Ensuring security and preventing fraud</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We may share your information in the following circumstances:</p>
            
            <h3>4.1 With Your Consent</h3>
            <p>We may share your information when you explicitly consent to such sharing.</p>

            <h3>4.2 Service Providers</h3>
            <p>We work with trusted third-party service providers who assist us in:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment processing</li>
              <li>Email communications</li>
              <li>Analytics and performance monitoring</li>
              <li>Customer support services</li>
            </ul>

            <h3>4.3 Legal Requirements</h3>
            <p>We may disclose your information when required by law or to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with legal processes or government requests</li>
              <li>Protect our rights, property, or safety</li>
              <li>Prevent fraud or security threats</li>
              <li>Enforce our terms of service</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection practices</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>6. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request copies of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in Section 11.
            </p>
          </section>

          <section>
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our platform. Cookies help us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Analyze how you use our platform</li>
              <li>Provide personalized content and recommendations</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
            <p>
              You can control cookies through your browser settings, but disabling cookies may affect the functionality of our platform.
            </p>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information is retained while your account is active</li>
              <li>Course progress and certificates are retained for your records</li>
              <li>Communication records are kept for customer service purposes</li>
              <li>Technical logs are typically retained for 12 months</li>
            </ul>
            <p>
              We may retain certain information for longer periods when required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information promptly.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes through our platform or via email. Your continued use of our services after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@edulearn.com</p>
              <p><strong>Data Protection Officer:</strong> dpo@edulearn.com</p>
              <p><strong>Address:</strong> EduLearn Privacy Team<br />
                123 Education Street<br />
                Learning City, LC 12345
              </p>
            </div>
          </section>

          <section className="bg-primary/5 p-6 rounded-lg">
            <h2>Your Privacy Matters</h2>
            <p>
              At EduLearn, we are committed to transparency and giving you control over your personal information. We believe that privacy is a fundamental right, and we strive to earn and maintain your trust through responsible data practices.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <Button
              variant="outline"
              onClick={() => onNavigate?.('home')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <p className="text-sm text-muted-foreground">
              We are committed to protecting your privacy and data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}