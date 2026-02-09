import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Bell, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Award, 
  BookOpen, 
  DollarSign,
  Clock,
  MoreVertical,
  Check
} from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'scholarship' | 'application' | 'reminder' | 'achievement';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Application Approved',
    message: 'Your scholarship application for Merit Excellence Award has been approved!',
    timestamp: '2 hours ago',
    isRead: false,
    category: 'scholarship'
  },
  {
    id: '2',
    type: 'info',
    title: 'New Scholarship Match',
    message: 'We found 3 new scholarships that match your profile. Check them out!',
    timestamp: '4 hours ago',
    isRead: false,
    category: 'scholarship'
  },
  {
    id: '3',
    type: 'warning',
    title: 'Application Deadline Soon',
    message: 'Your application for Tech Innovation Grant is due in 2 days.',
    timestamp: '6 hours ago',
    isRead: true,
    category: 'reminder'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Missing Documents',
    message: 'Please upload your transcript to complete your scholarship application.',
    timestamp: '1 day ago',
    isRead: false,
    category: 'application'
  },
  {
    id: '5',
    type: 'success',
    title: 'Profile Complete',
    message: 'Congratulations! Your profile is now 100% complete.',
    timestamp: '2 days ago',
    isRead: true,
    category: 'achievement'
  },
  {
    id: '6',
    type: 'info',
    title: 'Weekly Study Plan',
    message: 'Your personalized study plan for this week is ready to review.',
    timestamp: '3 days ago',
    isRead: true,
    category: 'reminder'
  },
  {
    id: '7',
    type: 'success',
    title: 'Essay Feedback Available',
    message: 'Your personal statement has been reviewed. View feedback now.',
    timestamp: '4 days ago',
    isRead: false,
    category: 'application'
  },
  {
    id: '8',
    type: 'info',
    title: 'New Course Recommendation',
    message: 'Based on your interests, we recommend "Advanced Mathematics" course.',
    timestamp: '5 days ago',
    isRead: true,
    category: 'achievement'
  }
];

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string, category: string) => {
    if (type === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (type === 'alert') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (type === 'warning') return <Clock className="h-5 w-5 text-orange-500" />;
    
    // Default to category icons for info type
    switch (category) {
      case 'scholarship':
        return <Award className="h-5 w-5 text-blue-500" />;
      case 'application':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'achievement':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const filterNotifications = (notifications: Notification[]) => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    return filtered;
  };

  const filteredNotifications = filterNotifications(notifications);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              Unread
              <Badge variant="secondary" className="ml-1">
                {unreadCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              Read
              <Badge variant="secondary" className="ml-1">
                {notifications.length - unreadCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm 
                      ? "Try adjusting your search terms." 
                      : activeTab === 'unread' 
                        ? "All caught up! No unread notifications." 
                        : "No notifications to display."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {notification.timestamp}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge 
                            variant="outline" 
                            className="text-xs capitalize"
                          >
                            {notification.category}
                          </Badge>
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