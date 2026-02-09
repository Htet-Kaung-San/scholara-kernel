import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Japan", "South Korea", "Singapore", "Netherlands",
  "Sweden", "Denmark", "Norway", "Switzerland", "Austria",
  "Italy", "Spain", "Portugal", "Belgium", "Ireland",
  "New Zealand", "Israel", "UAE", "Hong Kong", "Taiwan"
];

const educationLevels = [
  "High School",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD"
];

const interests = [
  "Scholarships",
  "Internships", 
  "Exchange Programs",
  "Research Programs",
  "Job Opportunities"
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nationality: "",
    residingCountry: "",
    age: "",
    currentInstitution: "",
    educationLevel: "",
    interests: [] as string[]
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleFinish = () => {
    setCurrentStep(4); // Move to welcome screen
  };

  const canProceedStep1 = formData.nationality && formData.residingCountry && formData.age;
  const canProceedStep2 = formData.currentInstitution && formData.educationLevel;
  const canProceedStep3 = formData.interests.length > 0;

  if (currentStep === 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="mb-4">Welcome, Student! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              We've matched <strong>12 scholarships</strong> and <strong>8 programs</strong> for you based on your profile.
            </p>
            <Button onClick={onComplete} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <h1>Complete Your Profile</h1>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of 3
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Select value={formData.nationality} onValueChange={(value) => setFormData({...formData, nationality: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="residingCountry">Residing Country</Label>
                <Select value={formData.residingCountry} onValueChange={(value) => setFormData({...formData, residingCountry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select where you live" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="22"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3>Education</h3>
              
              <div>
                <Label htmlFor="institution">Current Institution</Label>
                <Input
                  id="institution"
                  placeholder="Enter your school/university name"
                  value={formData.currentInstitution}
                  onChange={(e) => setFormData({...formData, currentInstitution: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="educationLevel">Education Level</Label>
                <Select value={formData.educationLevel} onValueChange={(value) => setFormData({...formData, educationLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3>Preferences</h3>
              <p className="text-sm text-muted-foreground">Interested in:</p>
              
              <div className="space-y-3">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    />
                    <Label htmlFor={interest}>{interest}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < 3 && (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
            
            {currentStep === 3 && (
              <Button 
                onClick={handleFinish}
                disabled={!canProceedStep3}
              >
                Finish
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}