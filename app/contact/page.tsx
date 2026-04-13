"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter } from "lucide-react";

const ContactUs = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Thank you for reaching out! We will get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our AI Trip Planner? We're here to help you forge your next adventure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Mail className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email Us</p>
                    <p className="text-lg font-semibold text-gray-900">kaibalyasahoo125@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Phone className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Call Us</p>
                    <p className="text-lg font-semibold text-gray-900">+91 12345 67890</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Visit Us</p>
                    <p className="text-lg font-semibold text-gray-900">Bhubaneswar, Odisha, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Our Journey</h3>
              <div className="flex gap-4">
                {[
                  { icon: <Github />, href: "#" },
                  { icon: <Linkedin />, href: "#" },
                  { icon: <Twitter />, href: "#" },
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="p-4 border-2 border-gray-100 rounded-2xl text-gray-600 hover:border-primary hover:text-primary transition-all duration-300 hover:scale-110"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* User Bio/Name Section */}
            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Designed by Kaibalya</h3>
              <p className="text-gray-600 leading-relaxed">
                I'm passionate about building AI-driven solutions that make travel planning effortless and exciting. 
                Let's connect and build something amazing together!
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Kaibalya Sahoo"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="kaibalyasahoo125@gmail.com"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Subject</label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Message</label>
                <Textarea
                  placeholder="Tell us more about your inquiry..."
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl min-h-[150px] focus:ring-2 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>

              <Button className="w-full py-8 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]">
                Send Message <Send className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
