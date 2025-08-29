import { planAndExecuteWorkflow } from "./plan-and-execute/index.js";

/*
 *   REACT AGENT
 */
/*
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
  */

/*
 *   PLAN AND EXECUTE
 */

const app = planAndExecuteWorkflow.compile();

const config = { recursionLimit: 50 };
const inputs = {
  input: "what is the hometown of the 2024 Australian open winner?",
};

for await (const event of await app.stream(inputs, config)) {
  console.log(event);
}
