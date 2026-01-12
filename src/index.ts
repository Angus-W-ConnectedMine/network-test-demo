import { serve } from "bun";
import index from "./index.html";
import QRCode from 'qrcode';

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

import os from 'os';

const getLocalNetworkIP = (): string => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (!nets) {
      continue;
    }

    for (const net of nets) {
      // Skip internal (loopback) and non-IPv4 addresses
      // 'internal' is a boolean indicating if the interface is internal or not
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }

  return ips[0] ?? "";
};

const localIP = getLocalNetworkIP();
const address = `http://${localIP}:${server.port}`
console.log(address);

QRCode.toString(address, { type: 'terminal' }, (err, url) => {
  if (err) throw err;
  console.log(url);
});

process.stdout.write("");
for await (const line of console) {
  for (const controller of openStreams) {
    controller.enqueue(encoder.encode(`data: ${line}\n\n`));
  }
}