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

### Current judged demo

The current build proves the creator loop against a fixed case file. It does not claim live platform ingestion.

```mermaid
flowchart LR
    caseFile["Operation Front Row case file<br/>questions · post results · asset ledger"]
    queue["Static briefs and queue reasoning"]
    creator["Creator workspace<br/>capture note · prioritise · publish"]

    subgraph next["Vercel · Next.js"]
        creatorAPI["Creator routes<br/>notes · card list · publish"]
        audienceAPI["Audience routes<br/>answer · save · forward · outcome"]
        store["Storage adapter"]
    end

    redis[("Upstash Redis<br/>notes · answers · audience events")]
    memory[("In-memory store<br/>local development only")]
    answer["Public answer<br/>/a/:cardId"]
    audience["Audience"]

    caseFile --> queue --> creator
    creator --> creatorAPI --> store
    store --> answer --> audience
    audience --> audienceAPI --> store
    store -->|"production"| redis
    store -.->|"development"| memory

    classDef person fill:#eef2f8,stroke:#1d3f6e,color:#16161a,stroke-width:1.5px;
    classDef surface fill:#ffffff,stroke:#d3d0c9,color:#16161a;
    classDef data fill:#eaf5ee,stroke:#197a4b,color:#16161a;
    class creator,audience person;
    class caseFile,queue,creatorAPI,audienceAPI,store,answer surface;
    class redis,memory data;
```

### Target product architecture

<p align="center">
  <img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="34" height="34" />&nbsp;&nbsp;<strong>Instagram</strong>&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YouTube" width="34" height="34" />&nbsp;&nbsp;<strong>YouTube</strong>&nbsp;&nbsp;&nbsp;&nbsp;
  <span aria-label="Newsletter">✉️</span>&nbsp;&nbsp;<strong>Newsletter providers</strong>
</p>

```mermaid
flowchart LR
    creator["Creator"]

    subgraph sources["Audience and content sources"]
        instagram["Instagram<br/>DMs · comments · insights"]
        youtube["YouTube<br/>comments · analytics"]
        newsletter["Newsletter providers<br/>replies · opens · clicks"]
        imports["Import fallback<br/>CSV · pasted messages"]
    end

    subgraph ingestion["Ingestion layer"]
        connections["Creator OAuth<br/>source connections"]
        sync["Webhooks and scheduled sync"]
        normalise["Normalise · deduplicate<br/>minimise personal data"]
    end

    postgres[("Postgres<br/>sources · messages · content<br/>clusters · sync cursors")]

    subgraph intelligence["Audience intelligence"]
        cluster["Semantic clustering<br/>question · volume · recency"]
        rank["Queue engine<br/>demand · intent · material · readiness"]
    end

    subgraph product["Front Row · Next.js"]
        auth["Creator account<br/>session"]
        workspace["Creator workspace<br/>notes · assets · content queue"]
        publish["Published answer"]
        reader["Public audience page"]
        events["Save · forward · outcome API"]
    end

    redis[("Redis<br/>live counters · cache")]
    audience["Audience"]

    creator --> connections
    creator --> auth --> workspace
    instagram --> sync
    youtube --> sync
    newsletter --> sync
    imports --> normalise
    connections --> sync --> normalise --> postgres
    postgres --> cluster --> rank --> workspace
    workspace -->|"creator judgement"| postgres
    workspace --> publish --> reader --> audience
    audience --> events
    events --> postgres
    events --> redis
    redis --> workspace

    classDef person fill:#eef2f8,stroke:#1d3f6e,color:#16161a,stroke-width:1.5px;
    classDef source fill:#fdf1e7,stroke:#a84a16,color:#16161a;
    classDef system fill:#ffffff,stroke:#d3d0c9,color:#16161a;
    classDef data fill:#eaf5ee,stroke:#197a4b,color:#16161a;
    class creator,audience person;
    class instagram,youtube,newsletter,imports source;
    class connections,sync,normalise,cluster,rank,auth,workspace,publish,reader,events system;
    class postgres,redis data;
```

The target diagram is the intended product, not a claim about the current build. Direct connectors require creator consent, provider permissions, sync cursors and deduplication. Import remains the fallback when a platform does not expose the required messages or analytics.

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

The judged demo is intentionally public. Anyone with the deployment URL can save notes and publish answers.

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
