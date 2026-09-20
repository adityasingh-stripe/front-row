# Front Row

Front Row helps Aditi turn repeated audience questions and first-hand room notes into an evidence-backed content queue, one trusted answer and a measurable next step.

## Product loop

1. Aditi captures the insight, cost and material from a room.
2. Front Row connects that note to repeated questions in the issued audience evidence.
3. The content queue explains what to publish next and what to acknowledge without creating individual reply work.
4. Aditi publishes her judgement and one next step.
5. The shared answer records genuine saves, forwards and reported outcomes.

Historical case evidence and live product activity remain separate. Illustrative judgement is labelled on every surface.

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
- `FRONT_ROW_ADMIN_TOKEN`, a private presenter key protecting note and publish mutations

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
