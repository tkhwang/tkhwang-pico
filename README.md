# PICO : Personal Intelligent COpilot

Personal AI playground and vertical field applications using PICO

## picoQUEUE: Content recommendation

`/apps/mobile-queue` : Content recommendation mobile app

### Technology

- [expo react native](https://docs.expo.dev/)
- [Supabase](https://supabase.com/docs): database
  - `pgvector` : vector plugin
- AUTH: [Clerk](https://clerk.com/docs)
- Tanstack query
- [react native reusables](https://reactnativereusables.com/docs)

### Recommend flow

![img](./docs/pico-queue-embdding-flow.png)

## AI Playground

### AI Backend

#### `/app/mastra` : [mastra.ai](https://mastra.ai/)

deployed on [mastra cloud](https://mastra.ai/en/docs/mastra-cloud/overview)

#### [LangChain.js](https://js.langchain.com/docs/introduction/) + [LangGraph.js](https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/)

With [nest.js](https://docs.nestjs.com/) API Server

- deployed on [Railway](https://docs.railway.com/)

### WEB

- `/apps/web` : [next.js](https://nextjs.org/docs)
  - deployed on [vercel](https://vercel.com/docs)
