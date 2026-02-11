import { serve, sql } from "bun";
import index from "./index.html";
import QRCode from 'qrcode';

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

        return Response.json({ payload_size_bytes: body.length })
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

import os from 'os';

const isIgnoredInterfaceName = (name: string): boolean => {
  const ignore = [
    /wsl\s*\(hyper-v firewall\)/i,
  ];

  return ignore.some((pattern) => pattern.test(name));
};

const getLocalNetworkIPs = (): string[] => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const name of Object.keys(interfaces)) {
    if (isIgnoredInterfaceName(name)) {
      continue;
    }

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

  return ips;
};

const localIPs = getLocalNetworkIPs();

if (localIPs.length == 0) {
  console.log("Could not determine local network IP address.");
  process.exit(1);
}

if (localIPs.length > 1) {
  console.log("Multiple network interfaces detected. Using the first one:", localIPs);
}

const localIP = localIPs[0]

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
