"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSunIcon } from "lucide-react";

interface CopilotKitComponentProps {
  runtimeUrl: string;
  agent?: string;
}

export function CopilotKitComponent({ runtimeUrl }: CopilotKitComponentProps) {
  if (!runtimeUrl) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-red-500">
            Error: Mastra runtime URL is not configured. Please check your
            environment variables.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-4 space-y-6">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently Available Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <Button variant={"outline"}>
                  <CloudSunIcon className="mr-2 h-auto w-3 flex-shrink-0" />
                  Weather
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <CopilotChat
            labels={{
              title: "Your Assistant",
              initial: "Hi! 👋 How can I assist you today?",
            }}
          />
        </div>
      </div>
    </div>
  );
}
