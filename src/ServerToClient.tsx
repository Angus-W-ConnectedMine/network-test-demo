import { useEffect } from "react";

type ServerToClientProps = {
  messages: string[];
  addMessage: (message: string) => void;
};

export function ServerToClient({ messages, addMessage }: ServerToClientProps) {
  useEffect(() => {
    const eventSource = new EventSource("/events");

    const handleMessage = (event: MessageEvent) => {
      addMessage(`Rx: ${event.data}`);
    };

    eventSource.addEventListener("message", handleMessage);

    return () => {
      eventSource.removeEventListener("message", handleMessage);
      eventSource.close();
    };
  }, [addMessage]);

  return (
    <div className="card terminal-output">
      {messages.length === 0 ? (
        <i>Waiting for messages...</i>
      ) : (
        messages.map((message, index) => <div key={`${index}-${message}`}>{message}</div>)
      )}
    </div>
  );
}

export default ServerToClient;
