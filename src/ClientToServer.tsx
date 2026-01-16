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

      addMessage("Tx: " + message);

      const url = "/api/message"
      const method = "PUT"
      const res = await fetch(url, { method, body });
      const data = await res.text()
      addMessage("Rx: " + data)
    } catch (error) {
      alert(`ERROR: ${error}`);
    }

    setMessage('');
  };

  return (
    <div className="w-full">
      <form
        onSubmit={testEndpoint}
        className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg p-2 font-mono">
        <span className="text-green-400 select-none">&gt;</span>

        <input type="text" name="message" placeholder="message" value={message} onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-transparent text-green-400 placeholder-zinc-600 outline-none border-none" />
        <button type="submit" className="px-3 py-1 text-green-400 border border-green-500/40 rounded hover:bg-green-500/10 active:bg-green-500/20 transition">
          Send
        </button>
      </form>
    </div>
  );
}
