# ts-motion

![Screenshot](screenshot.png)

An animation showing traffic passing between and amongst [Teacher Services
digital
services](https://tech-docs.teacherservices.cloud/#rails-apps-and-dependencies).

Work in progress.

## Architecture

```mermaid
sequenceDiagram
    participant client as Client
    participant express as Express.js
    participant frontend as Frontend
    participant bq as BigQuery

    client->>express: GET /
    activate express
    express->>client: Serve static HTML & JS
    deactivate express
    loop Every N minutes
        activate express
        express->>bq: Poll for latest traffic rates
        bq->>express: Return traffic rates
        express->>frontend: Send rate updates via websocket
        deactivate express
    end
    frontend-->>client: Render animation
```

## Running

```bash
npm install
npx ts-node --project tsconfig.server.json src/server/server.ts
```
