import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Notification {
  id: number;
  message: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNotRead: React.Dispatch<React.SetStateAction<number | null>>;
  isNotRead: number | null;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

const ENDPOINT = "http://localhost:8000";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, registerSocketHandler } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isNotRead, setIsNotRead] = useState<number | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) {
      setError("No access token available");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${ENDPOINT}/notifications`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setNotifications(response.data.notifications||[]);
      setIsOpen(true);
    } catch (err) {
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false); 
    }
  }, [accessToken]);

  useEffect(() => {
    registerSocketHandler("notification", (message: any) => {
      setNotifications((prevNotifications) => [
        ...(prevNotifications || []),
        message,
      ]);
      setIsOpen(false);
      setIsNotRead((prevCount) => (prevCount ? prevCount + 1 : 1));
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        loading,
        error,
        isOpen,
        setIsOpen,
        isNotRead,
        setIsNotRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a Notification Provider"
    );
  }
  return context;
};
