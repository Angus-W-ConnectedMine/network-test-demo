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
    <div className="flex h-screen w-screen justify-center flex-col md:flex-row p-4 mx-auto">
      <div className="flex flex-col max-w-[600px]">
        <div className="grow w-full h-full mb-4">
          <ServerToClient messages={messages} addMessage={addMessage} />
        </div>

        <ClientToServer addMessage={addMessage} />
      </div>

      <ServerTestButtons addMessage={addMessage} />
    </div>
  );
}

export default App;
