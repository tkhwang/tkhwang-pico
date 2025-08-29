import { graph } from "./react_agent/graph.js";

/*
 *   REACT AGENT
 */

const res = await graph.invoke({
  messages: [
    {
      role: "user",
      content: "Hello, just say hi back!",
    },
  ],
});

for (const message of res.messages) {
  console.log(message.content);
}

/*
 *   PLAN AND EXECUTE
 */
/*
const app = planAndExecuteWorkflow.compile();

const config = { recursionLimit: 50 };
const inputs = {
  input: "what is the hometown of the 2024 Australian open winner?",
};

try {
  const stream = await app.stream(inputs, config);
  for await (const event of stream) {
    console.log(event);
  }
} catch (err) {
  console.error("Stream failed:", err);
  process.exitCode = 1;
}
*/
