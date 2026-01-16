import React, { useEffect, useRef, useState } from "react";
import type { Props } from "./App";

export function ServerToClient({ messages, addMessage }: Props) {
    const esRef = useRef<EventSource | null>(null);

    useEffect(() => {
        const es = new EventSource("/events");
        esRef.current = es;

        const handleMessage = (e: MessageEvent) => {
            addMessage("Rx: " + e.data);
        };

        const handleError = (e: Event) => {
            // keep for debugging; close on fatal error if needed
            // console.error("EventSource error", e);
        };

        es.addEventListener("message", handleMessage);
        es.addEventListener("error", handleError);

        return () => {
            es.removeEventListener("message", handleMessage);
            es.removeEventListener("error", handleError);
            es.close();
            esRef.current = null;
        };
    }, []);

    return (
        <div className="whitespace-pre-wrap font-mono p-2 w-full h-full rounded-lg bg-[#111] overflow-y-scroll break-words text-left text-green-400">
            {messages.length === 0 ? (
                <i>Waiting for messages...</i>
            ) : (
                messages.map((m, i) => (
                    <div key={i}>
                        {m}
                    </div>
                ))
            )}
        </div>
    );
};

export default ServerToClient;