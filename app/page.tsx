import { Button } from "@/components/ui/button";
import Image from "next/image";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import { PopularCityList } from "./_components/PopularCityList";

export default function Home() {
  return (
    <div>
      <Hero />
      <PopularCityList />
    </div>
  );
}
