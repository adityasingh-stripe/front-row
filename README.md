# Front Row

Front Row helps creators turn repeated audience questions and first-hand insights into an evidence-backed content queue, one trusted answer and a measurable next step.

## Product loop

1. The creator captures the insight, cost and material from a room.
2. Front Row connects that note to repeated audience questions and existing material.
3. The content queue explains what to publish next and what to acknowledge without creating individual reply work.
4. The creator publishes their judgement and one next step.
5. The shared answer records genuine saves, forwards and reported outcomes.

## Demo case

The included demo applies this product loop to Aditi's Operation Front Row case. The creator workspace speaks directly to the signed-in creator as "you"; the audience view presents that creator's published judgement.

Historical case evidence and live product activity remain separate.

## Architecture

```mermaid
flowchart LR
    creator["Creator<br/>Workspace"]
    audience["Audience<br/>Shared answer"]

    subgraph next["Vercel · Next.js"]
        creatorUI["Creator UI<br/>/"]
        audienceUI["Audience UI<br/>/a/:cardId"]
        evidence["Static evidence<br/>and queue logic"]
        creatorAPI["Creator route handlers<br/>notes · card list · publish"]
        publicAPI["Public route handlers<br/>answer · save · forward · outcome"]
        store["Storage adapter"]
    end

    redis[("Upstash Redis<br/>live notes · answers · events")]
    memory[("In-memory store<br/>local development only")]

    creator --> creatorUI
    creatorUI --> evidence
    creatorUI -->|"Optional workspace key"| creatorAPI
    audience --> audienceUI
    audienceUI --> publicAPI
    creatorAPI --> store
    publicAPI --> store
    store -->|"production"| redis
    store -.->|"development"| memory

    classDef person fill:#eef2f8,stroke:#1d3f6e,color:#16161a,stroke-width:1.5px;
    classDef surface fill:#ffffff,stroke:#d3d0c9,color:#16161a;
    classDef data fill:#eaf5ee,stroke:#197a4b,color:#16161a;
    class creator,audience person;
    class creatorUI,audienceUI,evidence,creatorAPI,publicAPI,store surface;
    class redis,memory data;
```

Creator reads and edits pass through the workspace-key check unless public demo mode is enabled. Audience answers remain public so they can be saved and forwarded. Static case evidence feeds the queue; live notes, published answers and audience events are stored separately.

## Local development

```bash
npm install
npm run dev
```

Without Upstash variables, development uses an in-memory store that resets with the server. Production deliberately fails storage requests when Upstash is missing rather than silently losing audience activity.

To exercise a production build locally without Upstash, start it with `FRONT_ROW_LOCAL_STORE=1`. Do not set that flag on the deployed app.

## Production configuration

Set the variables listed in `.env.example`:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `FRONT_ROW_ADMIN_TOKEN`, the workspace key protecting creator reads and edits
- `FRONT_ROW_PUBLIC_DEMO=1`, bypasses the workspace key for a public judged demo

Public demo mode makes notes and publishing available to anyone with the deployment URL. Leave it unset when the creator workspace should remain private.

Then build and start:

```bash
npm run build
npm run start
```

The intended deployment is Vercel with Upstash Redis. The audience answer routes and API handlers require a Next.js runtime, so this is not a static export.

## Checks

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
```
