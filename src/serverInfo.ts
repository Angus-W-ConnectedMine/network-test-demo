
import os from 'os';
import QRCode from 'qrcode';

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

export function showServerQRCode(serverPort: number) {
    const localIPs = getLocalNetworkIPs();

    if (localIPs.length == 0) {
    console.log("Could not determine local network IP address.");
    process.exit(1);
    }

    if (localIPs.length > 1) {
    console.log("Multiple network interfaces detected. Using the first one:", localIPs);
    }

    const localIP = localIPs[0]

    const address = `http://${localIP}:${serverPort}`
    console.log(address);

    QRCode.toString(address, { type: 'terminal' }, (err, url) => {
    if (err) throw err;
        console.log(url);
    });
}