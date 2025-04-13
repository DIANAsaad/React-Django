import { createContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Notification {
  message: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  fetchNotifications: (reciever_id: number) => void;
  loading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

const ENDPOINT = "http://localhost:8000";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, registerSocketHandler } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (reciever_id: number) => {
    if (!accessToken) {
      setError("No access token available");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${ENDPOINT}/notifications/${reciever_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setNotifications(response.data);
    } catch (err) {
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }

    useEffect(() => {
      registerSocketHandler("notification", (message: any) => {
        setNotifications((prevNotifications) => [
          ...(prevNotifications || []),
          message,
        ]);
      });
    }, []);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, fetchNotifications, loading, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = NotificationContext;
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a Notification Provider"
    );
  }
  return context;
};
