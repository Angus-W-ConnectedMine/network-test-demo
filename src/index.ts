import { serve } from "bun";
import index from "./index.html";

const encoder = new TextEncoder();

const openStreams = new Set<ReadableStreamDefaultController>();

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/message": {
      async PUT(req) {
        const body = await req.json()
        const message = body.message
        console.log("from client: ", message)

        return Response.json({ "ok": "ok" });
      },
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

console.log(`🚀 Server running at ${server.url}`);

process.stdout.write("");
for await (const line of console) {
  for (const controller of openStreams) {
    controller.enqueue(encoder.encode(`data: ${line}\n\n`));
  }
}