"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // best-effort sign-out before redirect
    supabase.auth.signOut().catch((err) => {
      console.error("[LogoutPage] signOut failed:", err);
    });
    const timer = setTimeout(() => {
      router.replace("/"); // replace so “/logout” isn’t in history
    }, 2000);
    return () => clearTimeout(timer); // cleanup
  }, [router]);

  return <div>You have logged out... redirecting in a sec.</div>;
};

export default LogoutPage;
