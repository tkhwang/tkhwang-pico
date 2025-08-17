import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";

interface CopilotKitComponentProps {
  runtimeUrl: string;
  agent?: string;
}

export function CopilotKitComponent({
  runtimeUrl,
  agent = "weatherAgent",
}: CopilotKitComponentProps) {
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
    <CopilotKit runtimeUrl={runtimeUrl} agent={agent}>
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CopilotChat
            labels={{
              title: "Your Assistant",
              initial: "Hi! 👋 How can I assist you today?",
            }}
          />
        </div>
      </div>
    </CopilotKit>
  );
}
