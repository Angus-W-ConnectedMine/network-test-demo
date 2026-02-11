import { serve, sql } from "bun";
import index from "./index.html";
import { showServerQRCode } from "./serverInfo";

const encoder = new TextEncoder();

const openStreams = new Set<ReadableStreamDefaultController>();

const server = serve({
  port: 3030,

  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/message": {
      async PUT(req) {
        const body = await req.json()
        const message = body.message
        console.log("from client: ", message)

        return Response.json({ received: message, at: new Date().toISOString() });
      },
    },

    "/api/db": {
      async GET(req) {
        if (!process.env.DATABASE_URL) {
          return Response.json({ result: "no database connected" })
        }

        const result = await sql`SELECT VERSION();`;
        return Response.json({ result })
      }
    },

    "/api/data": {
      async POST(req) {
        const body = await req.text()

        const data = body.slice(0, 50)

        const message = `${data}... ${body.length} bytes`

        console.log(message)

        return Response.json({ result: body.length })
      }
    },

    "/events": {
      async GET(req) {
        const stream = new ReadableStream({
          start(controller) {
            openStreams.add(controller);

            req.signal.addEventListener("abort", () => {
              controller.close();
              openStreams.delete(controller);
            });
          },
        });


        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      }
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

showServerQRCode(server.port ?? 0)

const sendMessageToOpenStreams = (message: string) => {
  const data = encoder.encode(`data: ${message}\n\n`)

  for (const controller of openStreams) {
    controller.enqueue(data);
  }
}

// Read from stdin
process.stdout.write("");
for await (const line of console) {
  sendMessageToOpenStreams(line)
}
