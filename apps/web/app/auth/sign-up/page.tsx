import { SignUp } from "@clerk/nextjs";
import Navbar02Page from "@/components/navbar-02/navbar-02";

export default function Page() {
  return (
    <>
      <Navbar02Page />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full max-w-sm",
              card: "shadow-lg border",
            },
          }}
          redirectUrl="/"
        />
      </div>
    </>
  );
}
