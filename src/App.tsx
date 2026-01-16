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
    <div className="app">
      <ClientToServer messages={messages} addMessage={addMessage} />
      <ServerToClient messages={messages} addMessage={addMessage} />
    </div>
  );
}

export default App;
