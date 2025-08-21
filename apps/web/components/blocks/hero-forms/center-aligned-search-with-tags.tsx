"use client";

import { useRouter } from "next/navigation";

import Navbar02Page from "@/components/navbar-02/navbar-02";
import PicoInput from "@/components/pico-input";

export default function HeroFormCenterAlignedSearchWithTags() {
  const router = useRouter();

  const handleInputClick = () => {
    router.push("/auth/login");
  };

  return (
    <>
      <Navbar02Page />
      <PicoInput onInputClick={handleInputClick} />
    </>
  );
}
