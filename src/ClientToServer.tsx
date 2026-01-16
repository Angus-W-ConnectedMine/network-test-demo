import { useRef, useState, type FormEvent } from "react";
import type { Props } from "./App";

export function ClientToServer({ messages, addMessage }: Props) {
  const [message, setMessage] = useState('');

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const message = formData.get("message") as string;

      if (!message) return

      const body = JSON.stringify({
        "message": message
      })
      const url = "/api/message"
      const method = "PUT"
      const res = await fetch(url, { method, body });
      const data = await res.text()
      addMessage(data)
    } catch (error) {
      alert(`Error: ${error}`);
    }

    setMessage('');
  };

  return (
    <div className="api-tester">
      <form onSubmit={testEndpoint} className="endpoint-row">
        <input type="text" name="message" className="url-input" placeholder="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
