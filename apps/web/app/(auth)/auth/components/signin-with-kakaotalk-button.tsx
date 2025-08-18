"use client";

import { Button } from "@/components/ui/button";
import { getCommonConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

export const SignInWithKakaotalkButton = () => {
  async function signInWithKakao() {
    const supabase = await createClient();

    const { webUrl } = getCommonConfig();

    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${webUrl}/auth/callback`,
      },
    });
  }

  return (
    <Button
      type="button"
      className="w-full bg-[#FEE500] hover:bg-[#FEE500]/95 text-black/85 border-0 rounded-xl font-medium"
      onClick={() => {
        signInWithKakao();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 208 191"
        className="mr-2"
      >
        <path
          d="M104 0C46.6 0 0 36.9 0 82.4c0 29.4 19.5 55.2 48.6 69.5L39.8 191l40.6-24.4c7.7 1.1 15.7 1.6 23.6 1.6 57.4 0 104-36.9 104-82.4S161.4 0 104 0z"
          fill="#000000"
        />
      </svg>
      Login with Kakao
    </Button>
  );
};
