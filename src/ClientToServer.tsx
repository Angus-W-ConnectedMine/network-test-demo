import { useState, type FormEvent } from "react";

type ClientToServerProps = {
  addMessage: (message: string) => void;
};

export function ClientToServer({ addMessage }: ClientToServerProps) {
  const [message, setMessage] = useState("");

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    try {
      addMessage(`Tx: ${trimmed}`);

      const response = await fetch("/api/message", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { received?: string };
      const received = data.received ?? "(no message returned)";
      addMessage(`Rx: ${received}`);
      setMessage("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addMessage(`ERR: failed to send message (${errorMessage})`);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(event) => {
          void sendMessage(event);
        }}
        className="terminal-panel terminal-form"
      >
        <span className="terminal-prompt">&gt;</span>

        <input
          type="text"
          name="message"
          placeholder="message"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
          }}
          className="terminal-input"
        />

        <button type="submit" className="terminal-button">
          Send
        </button>
      </form>
    </div>
  );
}
