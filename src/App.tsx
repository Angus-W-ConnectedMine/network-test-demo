import { useState } from "react";
import { ClientToServer } from "./ClientToServer";
import "./index.css";
import ServerToClient from "./ServerToClient";

export type Props = {
  messages: string[];
  addMessage: (message: string) => void;
}

function generateRandomText(bytes: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
  const charsLen = chars.length;

  let result = "";

  let i = 0;
  while (i < bytes) {
    result += chars.charAt(Math.floor(Math.random() * charsLen));
    i++;
  }

  return result;
}

export function App() {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
  }

  const sendBulkData = async (mb: number) => {
    const bytes = mb * 1024 * 1024
    const data = generateRandomText(bytes)
    const res = await fetch("/api/data", { method: "POST", body: data })
    const status = await res.text()
    addMessage(status)
  }

  return (
    <div className="flex flex-col h-screen max-w-[600px] p-4 mx-auto">
      <div className="grow w-full h-full mb-4">
        <ServerToClient messages={messages} addMessage={addMessage} />
      </div>

      <ClientToServer messages={messages} addMessage={addMessage} />

      <div className="mx-auto flex flex-row gap-4 mt-4">
        <button className="p-3 py-1 text-green-400 border border-green-500/40 rounded hover:bg-green-500/10 active:bg-green-500/20 transition" onClick={() => sendBulkData(0.1)}>0.1 MB</button>
        <button className="p-3 py-1 text-green-400 border border-green-500/40 rounded hover:bg-green-500/10 active:bg-green-500/20 transition" onClick={() => sendBulkData(1.0)}>1.0 MB</button>
        <button className="p-3 py-1 text-green-400 border border-green-500/40 rounded hover:bg-green-500/10 active:bg-green-500/20 transition" onClick={() => sendBulkData(5)}>5.0 MB</button>
        <button className="p-3 py-1 text-green-400 border border-green-500/40 rounded hover:bg-green-500/10 active:bg-green-500/20 transition" onClick={() => sendBulkData(10)}>10.0 MB</button>
        <button className="p-3 py-1 text-green-400 border border-green-500/40 rounded hover:bg-green-500/10 active:bg-green-500/20 transition" onClick={() => sendBulkData(50)}>50.0 MB</button>
      </div>
    </div>
  );
}

export default App;
