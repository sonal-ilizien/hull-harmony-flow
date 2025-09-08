import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Anchor, Waves, Ship, Compass, Users, BarChart3, FileText, Settings, Navigation, Star, Zap, Sparkles, ArrowRight, Play, CheckCircle, Award, Clock, Globe, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import navalHeroBg from '@/assets/naval-hero-bg.jpg';
import slide1 from '@/assets/slide1.jpg';
import slide2 from '@/assets/slide2.jpg';
import slide3 from '@/assets/slide3.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    // Auto-rotate slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const slides = [
    {
      title: "WELCOME TO HULL INSIGHT",
      description: "FASTER RENDERING OF RETURNS/ REPORTS AND DEFECTS BY SHIPS AND REFITTING AGENCIES. FACILITATE STATISTICAL ANALYSIS HITUS, COMMANDS AND NHQ.",
      image: slide1
    },
    {
      title: "WELCOME TO HULL INSIGHT",
      description: "FASTER RENDERING OF RETURNS/ REPORTS AND DEFECTS BY SHIPS AND REFITTING AGENCIES. FACILITATE STATISTICAL ANALYSIS HITUS, COMMANDS AND NHQ.",
      image: slide2
    },
    {
      title: "WELCOME TO HULL INSIGHT",
      description: "FASTER RENDERING OF RETURNS/ REPORTS AND DEFECTS BY SHIPS AND REFITTING AGENCIES. FACILITATE STATISTICAL ANALYSIS HITUS, COMMANDS AND NHQ.",
      image: slide3
    }
  ];

  const services = [
    { title: "Navy", icon: <Ship className="w-8 h-8" /> },
    { title: "Navy", icon: <Anchor className="w-8 h-8" /> },
    { title: "Navy", icon: <Compass className="w-8 h-8" /> },
    { title: "Navy", icon: <Waves className="w-8 h-8" /> },
    { title: "Navy", icon: <Shield className="w-8 h-8" /> },
    { title: "Navy", icon: <Navigation className="w-8 h-8" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">HULL INSIGHT</h1>
                <p className="text-sm text-gray-600">Naval Maintenance Management</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-900 transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-900 transition-colors">About</a>
              <a href="#services" className="text-gray-700 hover:text-blue-900 transition-colors">Services</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-900 transition-colors">Contact</a>
            </nav>
            <Button 
              onClick={handleLoginClick}
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center text-white max-w-4xl mx-auto px-6">
                  <h2 className="text-4xl md:text-6xl font-bold mb-6">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl mb-8 leading-relaxed">
                    {slide.description}
                  </p>
                  <Button 
                    onClick={handleLoginClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-none shadow-lg"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-gray-50 p-8 rounded-lg">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Design Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Our systematic approach ensures comprehensive hull maintenance planning with integrated data analytics and predictive modeling for optimal vessel performance.
              </p>
            </div>
            <div className="text-center bg-gray-50 p-8 rounded-lg">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Innovative Solutions</h3>
              <p className="text-gray-600 leading-relaxed">
                Cutting-edge technology solutions including AI-powered defect detection, automated reporting systems, and real-time monitoring capabilities for naval operations.
              </p>
            </div>
            <div className="text-center bg-gray-50 p-8 rounded-lg">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Project Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Streamlined project workflows with comprehensive tracking, resource allocation, and milestone management for efficient naval maintenance operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beautiful About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-200/20 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Section - Beautiful Visual Design */}
            <div className="relative">
              {/* Main Image Container with Elegant Border */}
              <div className="relative group">
                {/* Decorative Border with Gradient */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-xl opacity-40 group-hover:opacity-50 transition-opacity duration-500"></div>
                
                {/* Main Image */}
                <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-xl p-8 shadow-2xl">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Ship className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Naval Excellence</h3>
                    <p className="text-blue-100 text-sm">Advanced Hull Management System</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">500+</p>
                      <p className="text-xs text-gray-600">Vessels</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">24/7</p>
                      <p className="text-xs text-gray-600">Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Beautiful Text Content */}
            <div className="space-y-8">
              {/* Header with Icon */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  ABOUT HULL INSIGHT
                </h2>
              </div>

              {/* Content with Beautiful Typography */}
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Hull Insight is an <span className="font-semibold text-blue-600">integrative software tool</span> aimed at effective life cycle management and paperless return and reports. The application ensures easy availability of all routine returns rendered by ship staff and survey rendered by repair yards across all stakeholders over the Naval Unified Domain.
                </p>
                
                <p className="text-lg text-gray-700 leading-relaxed">
                  Further, the <span className="font-semibold text-indigo-600">single repository concept</span> envisaged is aimed at ensuring an institutional memory for informed decision making. At DNA, we solicit constructive feedback and suggestions to further enhance the applicability of the portal towards reliable life cycle management of Hull and associated systems.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Life Cycle Management</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Paperless Reports</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Unified Domain</span>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700 font-medium">Institutional Memory</span>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <span>Read More</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beautiful Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                OUR SERVICES
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive naval management solutions designed to streamline operations and enhance efficiency
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/20"
              >
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <div className="text-blue-600 group-hover:text-indigo-600 transition-colors duration-300">
                      {service.icon}
                    </div>
                  </div>
                  
                  {/* Floating Decorative Element */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                    Comprehensive naval vessel management with advanced tracking systems, maintenance scheduling, and operational analytics for enhanced fleet efficiency.
                  </p>
                  
                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-xl transition-all duration-300 group-hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <span className="text-sm font-semibold">Read More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-colors duration-500"></div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Experience Our Services?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Discover how our comprehensive naval management solutions can transform your operations and enhance efficiency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLoginClick}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Access Services
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg rounded-xl transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">CONTACT US</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Our Address</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Directorate of Naval Architecture</p>
                    <p className="text-gray-600">Room No 200, Talkatora Stadium Annexe</p>
                    <p className="text-gray-600">New Delhi - 110 004</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-gray-900 font-semibold">NHQ-DNA-HULLINSIGHT</p>
                    <p className="text-gray-600">PAX: 6063, 6099</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <Button variant="outline" className="text-blue-900 border-blue-900 hover:bg-blue-900 hover:text-white">
                    Email Us
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h3>
              <p className="text-gray-600 mb-6">
                For any queries or support regarding Hull Insight, please contact us using the information provided.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded border">
                  <span className="text-gray-700">Last Updated</span>
                  <span className="font-semibold text-blue-900">06/09/2025</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded border">
                  <span className="text-gray-700">Visitors</span>
                  <span className="font-semibold text-blue-900">71,298</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm mb-2">
            All Rights Reserved with BISAG-N. This site is developed and maintained by BISAG-N & Ilizien.
          </p>
          <p className="text-xs text-blue-200">
            Last Updated 06/09/2025 | Visitors 71298
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;