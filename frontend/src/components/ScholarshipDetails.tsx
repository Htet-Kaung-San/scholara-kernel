import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Globe, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ScholarshipDetailsProps {
  onNavigate?: (page: string) => void;
}

export function ScholarshipDetails({ onNavigate }: ScholarshipDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const scholarshipInfo = {
    title: "Global Korea Scholarship (GKS)",
    provider: "Korean Government",
    country: "South Korea",
    type: "Full Scholarship",
    value: "Full tuition + Living allowance + Airfare",
    duration: "4-6 years",
    deadline: "March 31, 2024",
    status: "Open",
    applicants: "15,000+ annually",
    acceptance: "2-3%"
  };

  const eligibility = [
    "Must be a citizen of an eligible country",
    "Age limit: Under 25 for undergraduate, Under 40 for graduate programs",
    "Must have completed high school or equivalent for undergraduate",
    "Minimum GPA of 80% or equivalent",
    "Good physical and mental health",
    "No previous study experience in Korea exceeding 2 years"
  ];

  const benefits = [
    "Full tuition fee coverage",
    "Monthly living allowance (KRW 900,000)",
    "Round-trip airfare",
    "Korean language training (1 year)",
    "Medical insurance",
    "Settlement allowance",
    "Thesis printing allowance (for graduate students)"
  ];

  const requirements = [
    "Completed application form",
    "Official transcripts",
    "Letter of recommendation (2-3)",
    "Study plan and personal statement",
    "Medical certificate",
    "Passport copy",
    "Language proficiency certificate (if applicable)",
    "Portfolio (for arts programs)"
  ];

  const timeline = [
    { phase: "Application Submission", date: "September - March", status: "open" },
    { phase: "Document Review", date: "April - May", status: "upcoming" },
    { phase: "Interview (if required)", date: "May - June", status: "upcoming" },
    { phase: "Final Selection", date: "July", status: "upcoming" },
    { phase: "Visa Processing", date: "August", status: "upcoming" },
    { phase: "Departure to Korea", date: "September", status: "upcoming" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate?.('home')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scholarships
          </Button>
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Korean university campus"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            
            <div className="lg:w-2/3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {scholarshipInfo.status}
                </Badge>
                <Badge variant="outline">{scholarshipInfo.type}</Badge>
              </div>
              
              <h1 className="mb-4">{scholarshipInfo.title}</h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scholarshipInfo.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scholarshipInfo.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scholarshipInfo.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scholarshipInfo.acceptance} acceptance</span>
                </div>
              </div>
              
              <Button 
                className="bg-black text-white hover:bg-gray-800 px-8"
                onClick={() => onNavigate?.('signup')}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About the Global Korea Scholarship</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      The Global Korea Scholarship (GKS) is a prestigious scholarship program offered by the Korean Government 
                      to international students who wish to pursue undergraduate or graduate studies at Korean universities. 
                      This program aims to promote international exchanges in education and mutual friendship between Korea and other countries.
                    </p>
                    
                    <p>
                      The scholarship covers full tuition fees, provides monthly living allowances, and includes Korean language 
                      training to help students adapt to Korean academic and social environments. Recipients will have the 
                      opportunity to experience Korea's rich culture while receiving world-class education.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        Important Note
                      </h4>
                      <p className="text-sm text-blue-800">
                        All selected students must complete a one-year Korean language course before beginning their main studies, 
                        unless they already have TOPIK Level 3 or higher.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Provider:</span>
                      <span className="text-sm">{scholarshipInfo.provider}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="text-sm">Full Coverage</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Annual Applicants:</span>
                      <span className="text-sm">{scholarshipInfo.applicants}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate:</span>
                      <span className="text-sm">{scholarshipInfo.acceptance}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Application Deadline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-red-600 mb-2">
                        {scholarshipInfo.deadline}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Don't miss this opportunity!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eligibility" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
                <p className="text-muted-foreground">
                  Please ensure you meet all the following requirements before applying.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eligibility.map((criterion, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{criterion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Benefits</CardTitle>
                <p className="text-muted-foreground">
                  Comprehensive support for your study journey in Korea.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <p className="text-muted-foreground">
                  Prepare these documents for your application.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Document Guidelines
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• All documents must be in English or Korean</li>
                    <li>• Translations must be notarized</li>
                    <li>• Documents should be submitted in PDF format</li>
                    <li>• File size should not exceed 5MB per document</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <p className="text-muted-foreground">
                  Follow the scholarship application process timeline.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((phase, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          phase.status === 'open' ? 'bg-green-100 text-green-600' :
                          phase.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{phase.phase}</h4>
                        <p className="text-sm text-muted-foreground">{phase.date}</p>
                      </div>
                      <Badge variant={phase.status === 'open' ? 'default' : 'secondary'}>
                        {phase.status === 'open' ? 'Current' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <h3 className="mb-4">Ready to Apply?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Don't miss this incredible opportunity to study in Korea with full financial support. 
                Start your application today and take the first step towards your academic future.
              </p>
              <Button 
                className="bg-black text-white hover:bg-gray-800 px-8 py-3"
                onClick={() => onNavigate?.('signup')}
              >
                Start Your Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}