import { graph } from "./react_agent/graph.js";

const res = await graph.invoke({
  messages: [
    {
      role: "user",
      content: "What is the current weather in SF?",
    },
  ],
});

for (const message of res.messages) {
  console.log(message.content);
}
