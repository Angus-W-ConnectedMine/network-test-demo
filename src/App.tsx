import { useState } from "react";
import { ClientToServer } from "./ClientToServer";
import "./index.css";
import ServerToClient from "./ServerToClient";

export type Props = {
  messages: string[];
  addMessage: (message: string) => void;
}

export function App() {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
  }

  return (
    <div className="flex flex-col h-screen max-w-[600px] p-4 mx-auto">
      <div className="grow w-full h-full mb-4">
        <ServerToClient messages={messages} addMessage={addMessage} />
      </div>

      <ClientToServer messages={messages} addMessage={addMessage} />
    </div>
  );
}

export default App;
