import { useState } from "react";

const bulkDataSizes = [0.1, 1, 5, 10, 50] as const;

type ServerTestButtonsProps = {
  addMessage: (message: string) => void;
};

function generateRandomText(bytes: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  const charsLen = chars.length;

  let result = "";
  for (let i = 0; i < bytes; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * charsLen));
  }

  return result;
}

function formatDbResult(result: unknown): string {
  if (typeof result === "string") {
    return result;
  }

  try {
    return JSON.stringify(result);
  } catch {
    return String(result);
  }
}

export function ServerTestButtons({ addMessage }: ServerTestButtonsProps) {
  const [isSendingBulkData, setIsSendingBulkData] = useState(false);
  const [isFetchingDb, setIsFetchingDb] = useState(false);

  const isBusy = isSendingBulkData || isFetchingDb;

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

  const testDatabase = async () => {
    setIsFetchingDb(true);

    try {
      addMessage("Tx: testing /api/db");
      const response = await fetch("/api/db");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = (await response.json()) as { result?: unknown };
      addMessage(`Rx: ${formatDbResult(payload.result)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addMessage(`ERR: failed to fetch /api/db (${message})`);
    } finally {
      setIsFetchingDb(false);
    }
  };

  return (
    <div className="card flex flex-col h-fit gap-2 p-4 max-w-[600px]">
      <h2>Test Server</h2>
      <button
        type="button"
        className="terminal-button shrink-0 whitespace-nowrap"
        disabled={isBusy}
        onClick={() => {
          void testDatabase();
        }}
      >
        DB connected
      </button>

      {bulkDataSizes.map((size) => (
        <button
          key={size}
          type="button"
          className="terminal-button shrink-0 whitespace-nowrap"
          disabled={isBusy}
          onClick={() => {
            void sendBulkData(size);
          }}
        >
          {size.toFixed(1)} MB
        </button>
      ))}
    </div>
  );
}
