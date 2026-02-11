import { useCallback, useState } from "react";
import { ClientToServer } from "./ClientToServer";
import "./index.css";
import ServerToClient from "./ServerToClient";

const bulkMessageSizes = [0.1, 1, 5, 10, 50] as const;

type AddMessage = (message: string) => void;

function generateRandomText(bytes: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  const charsLen = chars.length;

  let result = "";
  for (let i = 0; i < bytes; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * charsLen));
  }

  return result;
}

export function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isSendingBulkData, setIsSendingBulkData] = useState(false);

  const addMessage: AddMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendBulkData = async (mb: number) => {
    setIsSendingBulkData(true);

    try {
      const bytes = Math.round(mb * 1024 * 1024);
      addMessage(`Tx: sending ${mb.toFixed(1)} MB (${bytes} bytes)`);

      const data = generateRandomText(bytes);
      const response = await fetch("/api/data", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as { payload_size_bytes?: number };
      const payloadSize = payload.payload_size_bytes ?? bytes;
      addMessage(`Rx: accepted ${payloadSize} bytes`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addMessage(`ERR: failed to send bulk data (${message})`);
    } finally {
      setIsSendingBulkData(false);
    }
  };

  return (
    <div className="flex h-screen max-w-[600px] flex-col p-4 mx-auto">
      <div className="grow w-full h-full mb-4">
        <ServerToClient messages={messages} addMessage={addMessage} />
      </div>

      <ClientToServer addMessage={addMessage} />

      <div className="mx-auto mt-4 flex flex-row gap-4">
        {bulkMessageSizes.map((size) => (
          <button
            key={size}
            className="terminal-button"
            disabled={isSendingBulkData}
            onClick={() => {
              void sendBulkData(size);
            }}
          >
            {size.toFixed(1)} MB
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
