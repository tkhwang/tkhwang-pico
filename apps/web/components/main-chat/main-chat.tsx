"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction } from "@copilotkit/react-core";
import { MainChatToolWeather } from "./tool/main-chat-tool-weather";
import Navbar02Page from "@/components/navbar-02/navbar-02";

export function MainChat() {
  useCopilotAction({
    name: "weatherTool",
    available: "disabled",
    render: ({ status, args }) => {
      return <MainChatToolWeather status={status} args={args} />;
    },
  });

  return (
    <>
      <Navbar02Page />
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mt-4 space-y-6">
          <div className="">
            <CopilotChat
              labels={{
                title: "Your Assistant",
                initial: "Hi! 👋 How can I assist you today?",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
