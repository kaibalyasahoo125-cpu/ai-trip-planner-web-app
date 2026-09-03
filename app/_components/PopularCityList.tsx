"use client";

import React from "react";
import Image from "next/image";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

export function PopularCityList() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
        Popular Destination to visit
      </h2>
      <Carousel items={cards} />
    </div>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(2).fill(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-6 md:p-10 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                Hand-picked destinations curated by travel experts.
              </span>{" "}
              Beautiful stays, iconic landmarks, and local experiences —
              planned for you in seconds by our AI trip assistant.
            </p>
          </div>
        );
      })}
    </>
  );
};

const data = [
    {
        category: "Paris, France",
        title: "Explore the City of Lights – Eiffel Tower, Louvre & more",
        src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=75&w=800&auto=format&fit=crop",
        content: <DummyContent />,
    },
    {
        category: "New York, USA",
        title: "Experience NYC – Times Square, Central Park, Broadway",
        src: "https://plus.unsplash.com/premium_photo-1661954654458-c673671d4a08?q=75&w=800&auto=format&fit=crop",
        content: <DummyContent />,
    },
    {
        category: "Tokyo, Japan",
        title: "Discover Tokyo – Shibuya, Cherry Blossoms, Temples",
        src: "https://images.unsplash.com/photo-1522547902298-51566e4fb383?q=75&w=800&auto=format&fit=crop",
        content: <DummyContent />,
    },
    {
        category: "Rome, Italy",
        title: "Walk through History – Colosseum, Vatican, Roman Forum",
        src: "https://plus.unsplash.com/premium_photo-1675975678457-d70708bf77c8?q=75&w=800&auto=format&fit=crop",
        content: <DummyContent />,
    },
    {
        category: "Dubai, UAE",
        title: "Luxury and Innovation – Burj Khalifa, Desert Safari",
        src: "https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=75&w=800&auto=format&fit=crop",
        content: <DummyContent />,
    },
    {
        category: "India",
        title: "Taj Mahal, Jaipur Palaces, Kerala Backwaters & more",
        src: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=75&w=800&auto=format&fit=crop",
        content: <DummyContent />,
    },
];

