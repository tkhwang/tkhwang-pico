import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LoginLogoutButton } from "@/components/login-logout-button";
import { PicoLogo } from "@/components/pico-logo";

const Navbar02Page = () => {
  return (
    <nav className="h-16 bg-background border-b">
      <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <PicoLogo />

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <LoginLogoutButton />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar02Page;
