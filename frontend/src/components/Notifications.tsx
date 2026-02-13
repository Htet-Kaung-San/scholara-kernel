import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Bell, Search, CheckCircle, AlertCircle, Calendar, Award, BookOpen, DollarSign, Clock, Check } from "lucide-react";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  category: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<Notification[]>("/notifications");
      setNotifications(res.data || []);
    } catch {
      // Fall back to empty — the endpoint might not exist yet
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const emitNotificationsChanged = () => {
    window.dispatchEvent(new Event("notifications:changed"));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string, category: string) => {
    if (type === "success") return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (type === "alert") return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (type === "warning") return <Clock className="h-5 w-5 text-orange-500" />;

    switch (category) {
      case "scholarship": return <Award className="h-5 w-5 text-blue-500" />;
      case "application": return <BookOpen className="h-5 w-5 text-purple-500" />;
      case "reminder": return <Calendar className="h-5 w-5 text-orange-500" />;
      case "achievement": return <DollarSign className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all", {});
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      emitNotificationsChanged();
    } catch {
      // Local-only fallback
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      emitNotificationsChanged();
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch("/notifications/read", { ids: [id] });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      emitNotificationsChanged();
    } catch {
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      emitNotificationsChanged();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      if (!n.title.toLowerCase().includes(lower) && !n.message.toLowerCase().includes(lower))
        return false;
    }
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "read") return n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">{unreadCount} unread notifications</p>
            </div>
          </div>
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0} className="flex items-center gap-2">
            <Check className="h-4 w-4" /> Mark all as read
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notifications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              Unread <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              Read <Badge variant="secondary" className="ml-1">{notifications.length - unreadCount}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? "Try adjusting your search terms." :
                      activeTab === "unread" ? "All caught up! No unread notifications." :
                        "No notifications to display."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${!notification.isRead ? "bg-primary/5" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getIcon(notification.type, notification.category)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full" />}
                            <span className="text-xs text-muted-foreground">{formatTime(notification.createdAt)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs capitalize">{notification.category}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
