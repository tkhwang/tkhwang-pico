import { LoginForm } from "@/components/login-form";
import Navbar02Page from "@/components/navbar-02/navbar-02";

export default function Page() {
  return (
    <>
      <Navbar02Page />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
