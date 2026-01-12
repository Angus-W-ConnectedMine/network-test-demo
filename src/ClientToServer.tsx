import { useRef, type FormEvent } from "react";

export function ClientToServer() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const message = formData.get("message") as string;
      const body = JSON.stringify({
        "message": message
      })
      const url = "/api/message"
      const method = "PUT"
      const res = await fetch(url, { method, body });
    } catch (error) {
    }
  };

  return (
    <div className="api-tester">
      <form onSubmit={testEndpoint} className="endpoint-row">
        <input type="text" name="message" className="url-input" placeholder="message" />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
