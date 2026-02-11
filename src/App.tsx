import { useCallback, useState } from "react";
import { ClientToServer } from "./ClientToServer";
import "./index.css";
import ServerToClient from "./ServerToClient";
import { ServerTestButtons } from "./ServerTestButtons";

type AddMessage = (message: string) => void;

export function App() {
  const [messages, setMessages] = useState<string[]>([]);

  const addMessage: AddMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return (
    <div className="mx-auto flex h-screen w-screen flex-col justify-center gap-4 overflow-hidden p-4 md:flex-row">
      <div className="flex min-h-0 max-w-[600px] flex-1 flex-col">
        <div className="mb-4 min-h-0 flex-1 w-full">
          <ServerToClient messages={messages} addMessage={addMessage} />
        </div>

        <ClientToServer addMessage={addMessage} />
      </div>

      <ServerTestButtons addMessage={addMessage} />
    </div>
  );
}

export default App;
