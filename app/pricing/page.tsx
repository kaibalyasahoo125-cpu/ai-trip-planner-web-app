"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out our AI trip planner.",
    features: [
      "3 AI-generated trips per month",
      "Basic itinerary details",
      "Standard support",
      "Community access",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For frequent travelers who want the best experience.",
    features: [
      "Unlimited AI-generated trips",
      "Premium hotel recommendations",
      "Interactive global map",
      "Priority support",
      "Export to PDF/Calendar",
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for travel agencies and groups.",
    features: [
      "Everything in Pro",
      "Custom AI models",
      "White-label options",
      "Dedicated account manager",
      "API access",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            AI-Powered Trip Planning - <span className="text-primary">Choose your Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of AI to forge your next dream adventure. Select a plan that fits your travel style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular ? "border-primary scale-105 z-10" : "border-transparent"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Sparkles className="size-4" /> Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-gray-500">/month</span>}
                </div>
                <p className="mt-4 text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {!user ? (
                <SignInButton mode="modal">
                  <Button
                    className="w-full rounded-xl py-6 text-lg font-bold"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                  </Button>
                </SignInButton>
              ) : (
                <Link href={plan.name === "Enterprise" ? "/contact" : "/create-new-trip"} className="w-full">
                  <Button
                    className="w-full rounded-xl py-6 text-lg font-bold"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-500 italic">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
