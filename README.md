# Cycling Speed Calculator

Solve for speed, distance, or time — pick what you want to find,
enter the other two.

- Distance = speed × time
- Speed = distance ÷ time
- Time = distance ÷ speed
- Kilometres (km/h) or miles (mph)
- Shareable link (base64url-encoded)

## Develop

```
npm install
npm run dev
npm run build      # tsc --noEmit && vite build
node --experimental-strip-types --test src/cycling.test.mjs
```

The engine (`distanceFromSpeedTime`, `speedFromDistanceTime`,
`timeHoursFromDistanceSpeed`) is in `src/cycling.ts`. 12 Node tests
in `src/cycling.test.mjs`.

## Deploy

Static assets on Cloudflare Workers (`wrangler.jsonc`). Live at
<https://cycling-speed-calculator.correia95.workers.dev/>.
