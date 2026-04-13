"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const menuOptions = [
  { name: "Home", path: "/" },
  { name: "Pricing", path: "/pricing" },
  { name: "Contact us", path: "/contact" },
];

function Header() {
  const { user } = useUser();
  const path = usePathname();

  return (
    <div className="flex justify-between items-center p-4 shadow-sm">
      
      {/* Logo */}
      <div className="flex gap-2 items-center">
        <Image src={"/logo.svg"} alt="logo" width={30} height={30} />
        <h2 className="font-bold text-2xl">AI Trip Planner</h2>
      </div>

      {/* Menu (Desktop) */}
      <div className="hidden md:flex gap-8 items-center">
        {menuOptions.map((menu, index) => (
          <Link key={index} href={menu.path}>
            <h2
              className={`text-lg transition-all hover:text-primary hover:scale-105 ${
                path === menu.path ? "text-primary font-semibold" : ""
              }`}
            >
              {menu.name}
            </h2>
          </Link>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex gap-3 sm:gap-5 items-center">
        {!user ? (
          <SignInButton mode="modal">
            <Button>Get Started</Button>
          </SignInButton>
        ) : (
          <>
            {path === "/create-new-trip" ? (
              <Link href="/my-trips">
                <Button>My Trips</Button>
              </Link>
            ) : (
              <Link href="/create-new-trip">
                <Button>Create a Trip</Button>
              </Link>
            )}
            <UserButton />
          </>
        )}
      </div>
    </div>
  );
}

export default Header;