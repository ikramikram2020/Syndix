import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Pricing from "../components/landing/Pricing";
import Footer from "../components/landing/Footer";
import CallToAction from '../components/landing/CallToAction';
// Import other components as needed

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CallToAction /> 
      </main>
      
      <Footer />
    </div>
  );
}