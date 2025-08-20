import { SignInWithGoogleButton } from "@/components/auth/signin-with-google-button";
import { SignInWithKakaotalkButton } from "@/components/auth/signin-with-kakaotalk-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google or KakaoTalk account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-3">
              <div className="flex flex-col gap-4">
                <SignInWithGoogleButton />
              </div>
              <div className="flex flex-col gap-4">
                <SignInWithKakaotalkButton />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
