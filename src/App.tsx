import { useCallback, useState } from "react";
import { TerminalInput } from "./TerminalInput";
import "./index.css";
import TerminalDisplay from "./TerminalDisplay";
import { TestFunctions } from "./TestFunctions";

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
          <TerminalDisplay messages={messages} addMessage={addMessage} />
        </div>

        <TerminalInput addMessage={addMessage} />
      </div>

      <TestFunctions addMessage={addMessage} />
    </div>
  );
}

export default App;
