import React from "react";
import HeroSection from "../components/home/HeroSection";
import ServicesSection from "../components/home/ServicesSection";
import ProductsSection from "../components/home/ProductsSection";
import AboutSection from "../components/home/AboutSection";
import ContactSection from "../components/home/ContactSection";
import { bgColor } from "../bgColor/bgColor";

const HomePage = () => {
  return (
    <main className={`min-h-screen ${bgColor.body}`}>
      <HeroSection bgColor={bgColor} />
      <ProductsSection bgColor={bgColor} />
      <ServicesSection bgColor={bgColor} />
      <AboutSection bgColor={bgColor} />
      <ContactSection bgColor={bgColor} />
    </main>
  );
};

export default HomePage;