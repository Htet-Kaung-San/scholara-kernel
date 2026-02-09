import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, X, Info } from "lucide-react";
import { Switch } from "./ui/switch";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      description: "For individuals just getting started",
      featured: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Basic",
      price: { monthly: 39, annual: 31 },
      description: "For small teams and projects",
      featured: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      price: { monthly: 59, annual: 47 },
      description: "For growing teams and businesses",
      featured: true,
      buttonText: "Get Started",
      buttonVariant: "default" as const,
      badge: "Most Popular",
    },
    {
      name: "Enterprise",
      price: { monthly: 129, annual: 103 },
      description: "For large organizations",
      featured: false,
      buttonText: "Contact Our Sales",
      buttonVariant: "outline" as const,
    },
  ];

  const features = [
    {
      category: "Workspace",
      items: [
        {
          name: "Number of seats",
          free: "Up to 3",
          basic: "Unlimited",
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
        {
          name: "Number of projects",
          free: "Up to 3",
          basic: "Up to 8",
          pro: "Up to 12",
          enterprise: "Unlimited",
        },
      ],
    },
    {
      category: "Automations",
      items: [
        {
          name: "Number of events",
          free: "200",
          basic: "2000",
          pro: "4000",
          enterprise: "5000+",
        },
      ],
    },
    {
      category: "Email and Calendar",
      items: [
        {
          name: "Email and calendar sync",
          free: "1 account per user",
          basic: "2 accounts per user",
          pro: "4 accounts per user",
          enterprise: "10+ accounts per user",
        },
        {
          name: "Email tracking",
          free: "Individual messages",
          basic: "Individual attachments",
          pro: "Specific contacts",
          enterprise: "Specific contacts",
        },
        {
          name: "Email status amount",
          free: "500 status per month",
          basic: "1000 status per month",
          pro: "Unlimited",
          enterprise: "Unlimited",
        },
        {
          name: "Bulk email sending",
          free: "10 sends at a time",
          basic: "20 sends at a time",
          pro: "50 sends at a time",
          enterprise: "100 sends at a time",
        },
        {
          name: "Remove email watermark",
          free: false,
          basic: true,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Reporting",
      items: [
        {
          name: "Number of reports",
          free: "3 reports",
          basic: "20 reports",
          pro: "100 reports",
          enterprise: "Unlimited",
        },
        {
          name: "Insight Reports",
          free: false,
          basic: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Sales Reports",
          free: false,
          basic: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Activity Reports",
          free: false,
          basic: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Email Reports",
          free: false,
          basic: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Data Model",
      items: [
        {
          name: "Access permissions",
          free: "Fully visible",
          basic: "Private",
          pro: "Advanced",
          enterprise: "Advanced",
        },
      ],
    },
    {
      category: "Admin",
      items: [
        {
          name: "Payment invoices",
          free: false,
          basic: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "SAML SSO",
          free: false,
          basic: false,
          pro: true,
          enterprise: true,
        },
      ],
    },
    {
      category: "Support",
      items: [
        {
          name: "Help center",
          free: true,
          basic: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Chat and email support",
          free: true,
          basic: true,
          pro: true,
          enterprise: true,
        },
        {
          name: "Priority support",
          free: false,
          basic: false,
          pro: false,
          enterprise: true,
        },
        {
          name: "Migration assistance",
          free: false,
          basic: "Chat with us",
          pro: "Chat with us",
          enterprise: "Chat with us",
        },
      ],
    },
  ];

  const renderFeatureValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-400" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">Compare Plans</h1>
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={!isAnnual ? "opacity-100" : "opacity-50"}>
              Billed Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={isAnnual ? "opacity-100" : "opacity-50"}>
              Billed Annually
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.featured
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <h3 className="mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-sm opacity-75 ml-1">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm opacity-75">{plan.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant={plan.featured ? "secondary" : plan.buttonVariant}
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 w-1/4"></th>
                    <th className="text-center p-4 w-3/16">Free</th>
                    <th className="text-center p-4 w-3/16">Basic</th>
                    <th className="text-center p-4 w-3/16 bg-primary/5">Pro</th>
                    <th className="text-center p-4 w-3/16">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((category) => (
                    <React.Fragment key={category.category}>
                      <tr className="border-b">
                        <td
                          colSpan={5}
                          className="p-4 bg-muted/50 font-medium"
                        >
                          {category.category}
                        </td>
                      </tr>
                      {category.items.map((item, itemIndex) => (
                        <tr
                          key={`${category.category}-${itemIndex}`}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="p-4 flex items-center gap-2">
                            <span>{item.name}</span>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </td>
                          <td className="p-4 text-center">
                            {renderFeatureValue(item.free)}
                          </td>
                          <td className="p-4 text-center">
                            {renderFeatureValue(item.basic)}
                          </td>
                          <td className="p-4 text-center bg-primary/5">
                            {renderFeatureValue(item.pro)}
                          </td>
                          <td className="p-4 text-center">
                            {renderFeatureValue(item.enterprise)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <h2 className="mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you find the right plan for your needs.
          </p>
          <Button size="lg">Contact Sales</Button>
        </div>
      </div>
    </div>
  );
}