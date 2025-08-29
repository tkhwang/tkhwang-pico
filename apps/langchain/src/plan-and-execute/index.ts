import "dotenv/config";

import z from "zod";

import { tool } from "@langchain/core/tools";
import { JsonOutputToolsParser } from "@langchain/core/output_parsers/openai_tools";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { TavilySearch } from "@langchain/tavily";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";

const PlanExecuteState = Annotation.Root({
  input: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "",
  }),
  plan: Annotation<string[]>({
    reducer: (x, y) => y ?? x ?? [],
  }),
  pastSteps: Annotation<[string, string][]>({
    reducer: (x, y) => [...(x ?? []), ...(y ?? [])],
  }),
  response: Annotation<string>({
    reducer: (x, y) => y ?? x,
  }),
});

const tools = [new TavilySearch({ maxResults: 3 })];

const agentExecutor = createReactAgent({
  llm: new ChatOpenAI({
    model: "gpt-4o-mini",
  }),
  tools,
});

// const response = await agentExecutor.invoke({
//   messages: [new HumanMessage("who is the winner of the us open")],
// });

// console.log(response);

const planObject = z.object({
  steps: z
    .array(z.string())
    .describe("different steps to follow, should be in sorted order"),
});

const plannerPrompt = ChatPromptTemplate.fromTemplate(
  `For the given objective, come up with a simple step by step plan. \
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps. \
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

{objective}`
);

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
});

const structuredModel = model.withStructuredOutput(planObject);

const planner = plannerPrompt.pipe(structuredModel);

// const response = await planner.invoke({
//   objective: "what is the hometown of the current Australia open winner?",
// });

// console.log(response);

const responseObject = z.object({
  response: z.string().describe("Response to user."),
});

const responseTool = tool(() => {}, {
  name: "response",
  description: "Respond to the user.",
  schema: responseObject,
});

const planTool = tool(() => {}, {
  name: "plan",
  description: "This tool is used to plan the steps to follow.",
  schema: planObject,
});

interface ToolCall {
  type: string;
  args?: any;
}

const replannerPrompt = ChatPromptTemplate.fromTemplate(
  `For the given objective, come up with a simple step by step plan. 
This plan should involve individual tasks, that if executed correctly will yield the correct answer. Do not add any superfluous steps.
The result of the final step should be the final answer. Make sure that each step has all the information needed - do not skip steps.

Your objective was this:
{input}

Your original plan was this:
{plan}

You have currently done the follow steps:
{pastSteps}

Update your plan accordingly. If no more steps are needed and you can return to the user, then respond with that and use the 'response' function.
Otherwise, fill out the plan.  
Only add steps to the plan that still NEED to be done. Do not return previously done steps as part of the plan.`
);

const parser = new JsonOutputToolsParser();
const replanner = replannerPrompt.pipe(
  new ChatOpenAI({
    model: "gpt-4o-mini",
  })
    .bindTools([planTool, responseTool])
    .pipe(parser)
);

async function executeStep(
  state: typeof PlanExecuteState.State,
  config?: RunnableConfig
): Promise<Partial<typeof PlanExecuteState.State>> {
  const task = state.plan[0];
  const input = {
    messages: [new HumanMessage(task ?? "")],
  };
  const { messages } = await agentExecutor.invoke(input, config);

  return {
    pastSteps: [[task, messages[messages.length - 1].content.toString()]],
    plan: state.plan.slice(1),
  };
}

async function planStep(state: typeof PlanExecuteState.State) {
  const plan = await planner.invoke({
    objective: state.input,
  });

  return {
    plan: plan.steps,
  };
}

async function replanStep(state: typeof PlanExecuteState.State) {
  const output = (await replanner.invoke({
    input: state.input,
    plan: state.plan.join("\n"),
    pastSteps: state.pastSteps
      .map(([step, result]) => `${step}: ${result}`)
      .join("\n"),
  })) as ToolCall[];
  const toolCall = output[0];

  if (toolCall.type === "response") {
    return {
      response: toolCall.args?.response,
    };
  }

  return {
    plan: toolCall.args?.steps,
  };
}

function shouldEnd(state: typeof PlanExecuteState.State) {
  return state.response ? "true" : "false";
}

export const planAndExecuteWorkflow = new StateGraph(PlanExecuteState)
  .addNode("planner", planStep)
  .addNode("agent", executeStep)
  .addNode("replan", replanStep)
  .addEdge(START, "planner")
  .addEdge("planner", "agent")
  .addEdge("agent", "replan")
  .addConditionalEdges("replan", shouldEnd, {
    true: END,
    false: "agent",
  });
