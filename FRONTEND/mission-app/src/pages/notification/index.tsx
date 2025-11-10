import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DashboardContainer, TableContainer, TableHeader, TableTitle, StatusBadge, ButtonDetails, DeleteButton, Loading, NoDataMessage } from '@/styles/table-styles';
import Pagination from "@/components/pagination";

// Assuming you have icons from a library like react-icons
import { MdNotificationsActive, MdDelete, MdCheckCircle, MdSchedule, MdMarkEmailRead } from 'react-icons/md';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
  status: 'unread' | 'read';
  type: 'mission_created' | 'other'; // Extend as needed
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Simulate real-time data fetching/updates (e.g., via WebSocket or polling)
  useEffect(() => {
    // Initial load
    const fetchNotifications = async () => {
      // Mock data - replace with actual API call
      const mockData = Array.from({ length: 25 }, (_, index) => ({
        id: (index + 1).toString(),
        title: 'Nouvelle mission créée',
        message: `Une mission a été créée par Miantsafitia RAKOTOARIMANANA (DRH) - Notification ${index + 1}`,
        createdBy: 'Miantsafitia RAKOTOARIMANANA (DRH)',
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(), // Random dates in last 30 days
        status: Math.random() > 0.5 ? ('unread' as const) : ('read' as const),
        type: 'mission_created' as const
      })) as Notification[];
      mockData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date descending
      setNotifications(mockData);
      setTotalCount(mockData.length);
      setLoading(false);
    };

    fetchNotifications();

    // Simulate real-time update (e.g., every 10 seconds or on WebSocket message)
    const interval = setInterval(() => {
      // Simulate new notification
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: 'Nouvelle mission créée',
        message: 'Une mission a été créée par Miantsafitia RAKOTOARIMANANA (DRH)',
        createdBy: 'Miantsafitia RAKOTOARIMANANA (DRH)',
        createdAt: new Date().toISOString(),
        status: 'unread' as const,
        type: 'mission_created' as const
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        setTotalCount(updated.length);
        // Scroll to top for new notification
        setTimeout(() => {
          notificationsRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        return updated;
      });
    }, 10000); // Adjust interval as needed

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalCount(notifications.length);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => 
      filterStatus === 'all' || notif.status === filterStatus
    );
  }, [notifications, filterStatus]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredNotifications.slice(startIndex, startIndex + pageSize);
  }, [filteredNotifications, page, pageSize]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, status: 'read' as const } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => 
      notif.status === 'unread' ? { ...notif, status: 'read' as const } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== id);
      setTotalCount(updated.length);
      return updated;
    });
    if ((page - 1) * pageSize >= totalCount - 1) {
      setPage(Math.max(1, Math.ceil((totalCount - 1) / pageSize)));
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <TableContainer>
          <Loading>Chargement des notifications...</Loading>
        </TableContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>

      <TableContainer>
        <TableHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdNotificationsActive size={24} style={{ color: unreadCount > 0 ? '#f50057' : '#757575' }} />
            <TableTitle style={{ margin: 0 }}>Liste des notifications</TableTitle>
            {unreadCount > 0 && (
              <StatusBadge className="status-unread" style={{ fontSize: '12px', padding: '2px 6px', borderRadius: '10px' }}>
                {unreadCount}
              </StatusBadge>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'unread' | 'read')}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="all">Toutes</option>
              <option value="unread">Non lues</option>
              <option value="read">Lues</option>
            </select>
            {unreadCount > 0 && (
              <ButtonDetails onClick={markAllAsRead} title="Tout marquer comme lu" style={{ padding: '8px' }}>
                <MdMarkEmailRead size={18} />
              </ButtonDetails>
            )}
          </div>
        </TableHeader>

        {paginatedNotifications.length === 0 ? (
          <NoDataMessage>
            {filteredNotifications.length === 0 ? 'Aucune notification correspondante.' : 'Aucune notification sur cette page.'}
          </NoDataMessage>
        ) : (
          <div ref={notificationsRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
            {paginatedNotifications.map((notification, _index) => (
              <div
                key={notification.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  border: `1px solid ${notification.status === 'unread' ? '#ffeaa7' : '#e9ecef'}`,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${notification.status === 'unread' ? '#fff3cd' : '#f8f9fa'} 0%, ${notification.status === 'unread' ? '#ffeaa7' : '#e9ecef'} 100%)`,
                  boxShadow: notification.status === 'unread' ? '0 4px 12px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: `fadeInUp 0.5s ease-out ${_index * 0.1}s forwards`, // Staggered animation
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = notification.status === 'unread' ? '0 8px 20px rgba(255, 193, 7, 0.4)' : '0 4px 12px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = notification.status === 'unread' ? '0 4px 12px rgba(255, 193, 7, 0.3)' : '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                {/* Header: Icon, Title, and Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: notification.type === 'mission_created' ? '#1976d2' : '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                      }}
                    >
                      M
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '16px', 
                        fontWeight: notification.status === 'unread' ? 'bold' : '500',
                        color: notification.status === 'unread' ? '#333' : '#666',
                      }}>
                        {notification.title}
                      </h4>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '14px', 
                        lineHeight: '1.4', 
                        color: '#888',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <StatusBadge 
                    className={`status-${notification.status}`} 
                    style={{ 
                      fontSize: '11px', 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      minWidth: '60px',
                      textAlign: 'center',
                    }}
                  >
                    {notification.status === 'unread' ? 'Non lue' : 'Lue'}
                  </StatusBadge>
                </div>

                {/* Footer: Metadata and Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingTop: '8px', 
                  borderTop: '1px solid #eee',
                  fontSize: '12px', 
                  color: '#999' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MdSchedule size={14} />
                    <span>Par {notification.createdBy.split(' ')[0]}</span>
                    <span style={{ marginLeft: '8px' }}>| {new Date(notification.createdAt).toLocaleString('fr-FR', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <ButtonDetails
                      onClick={() => markAsRead(notification.id)}
                      title="Marquer comme lue"
                      style={{ 
                        padding: '6px', 
                        minWidth: '36px', 
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #ddd',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MdCheckCircle size={16} />
                    </ButtonDetails>
                    <DeleteButton
                      onClick={() => deleteNotification(notification.id)}
                      title="Supprimer"
                      style={{ 
                        padding: '6px', 
                        minWidth: '36px', 
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid #ddd',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MdDelete size={16} />
                    </DeleteButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalEntries={filteredNotifications.length}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </TableContainer>

      <style>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardContainer>
  );
};

export default NotificationsPage;