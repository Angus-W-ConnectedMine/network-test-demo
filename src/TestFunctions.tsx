import { useState } from "react";

const bulkDataSizes = [0.1, 1, 5, 10, 50] as const;

type ServerTestButtonsProps = {
  addMessage: (message: string) => void;
};

function generateRandomText(bytes: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  const charsLen = chars.length;

  const randomTextArray = new Array(bytes);

  for (let i = 0; i < bytes; i++) {
    randomTextArray[i] = chars.charAt(Math.floor(Math.random() * charsLen));
  }

  return randomTextArray.join('');
}

export function TestFunctions({ addMessage }: ServerTestButtonsProps) {
  const [isSendingBulkData, setIsSendingBulkData] = useState(false);
  const [isFetchingDb, setIsFetchingDb] = useState(false);

  const isBusy = isSendingBulkData || isFetchingDb;

  const sendBulkData = async (mb: number) => {
    setIsSendingBulkData(true);

    try {
      const bytes = Math.round(mb * 1024 * 1024);
      addMessage(`Tx: sending ${bytes} bytes`);

      const data = generateRandomText(bytes);
      const response = await fetch("/api/data", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json()
      addMessage(`Rx: accepted ${payload.result} bytes`);
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

      const payload = await response.json();
      addMessage(`Rx: ${payload.result}`);
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
