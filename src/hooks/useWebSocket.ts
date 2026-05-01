"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

interface WsMessage {
  type: string;
  payload?: any;
  target_user_id?: string;
  correlation_id?: string;
  timestamp: number;
}

interface UseWebSocketOptions {
  onMessage?: (msg: WsMessage) => void;
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { onMessage, autoConnect = true } = options;
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 10;

  const connect = useCallback(() => {
    const token = api.getToken();
    if (!token) {
      setStatus("disconnected");
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws";
    setStatus("connecting");

    try {
      const ws = new WebSocket(`${wsUrl}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          onMessage?.(msg);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = (event) => {
        wsRef.current = null;

        // Don't reconnect if intentionally closed
        if (event.code === 1000) {
          setStatus("disconnected");
          return;
        }

        // Reconnect with exponential backoff + jitter
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setStatus("reconnecting");
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          const jitter = Math.random() * 1000;
          reconnectAttempts.current++;

          reconnectTimer.current = setTimeout(() => {
            connect();
          }, delay + jitter);
        } else {
          setStatus("disconnected");
        }
      };

      ws.onerror = () => {
        // onclose will fire after this
      };
    } catch {
      setStatus("disconnected");
    }
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const send = useCallback((msg: WsMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return { status, connect, disconnect, send };
}
