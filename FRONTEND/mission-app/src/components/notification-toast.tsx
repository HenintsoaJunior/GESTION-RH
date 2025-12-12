"use client";

import { useEffect, useState } from 'react';
import { useUnreadNotifications } from '@/api/notifications/services';
import type { NotificationData } from '@/api/notifications/services';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import styled, { keyframes } from "styled-components";

const slideInTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface ToastNotificationProps {
  notification: NotificationData;
  onDismiss: () => void;
}

const ToastNotifWrapper = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  max-width: 20rem;
  width: 100%;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(135deg, #5a8c42 0%, #69b42e 100%);
  }

  &:hover {
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
  }
`;

const ToastContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ToastDetails = styled.div`
  flex: 1;
  cursor: pointer;
`;

const ToastTitle = styled.h3`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
  line-height: 1.3;
`;

const ToastMessage = styled.p`
  font-size: 0.75rem;
  color: #475569;
  margin-bottom: 0.375rem;
  line-height: 1.4;
`;

const ToastTime = styled.p`
  font-size: 0.6875rem;
  color: #94a3b8;
  font-family: 'Monaco', 'Menlo', monospace;
`;

const DismissButton = styled.button`
  margin-left: 0.5rem;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 0;
  transition: all 0.15s ease;

  &:hover {
    color: #5a9625;
    background-color: rgba(105, 180, 46, 0.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ToastNotification: React.FC<ToastNotificationProps> = ({ notification, onDismiss }) => {
  const createdAt = notification.createdAt ? new Date(notification.createdAt) : new Date();
  const timeAgo = format(createdAt, 'MMM dd, yyyy HH:mm');

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <ToastNotifWrapper>
      <ToastContent>
        <ToastDetails onClick={onDismiss}>
          <ToastTitle>{notification.notification.title}</ToastTitle>
          <ToastMessage>{notification.notification.message}</ToastMessage>
          <ToastTime>{timeAgo}</ToastTime>
        </ToastDetails>
        <DismissButton
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </DismissButton>
      </ToastContent>
    </ToastNotifWrapper>
  );
};

interface ToastContainerProps {
  userId: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface PositionStyles {
  [key: string]: string;
}

const positionStyles: PositionStyles = {
  'top-right': 'top: 1rem; right: 1rem;',
  'top-left': 'top: 1rem; left: 1rem;',
  'bottom-right': 'bottom: 1rem; right: 1rem;',
  'bottom-left': 'bottom: 1rem; left: 1rem;',
};

const getAnimation = (position: string) => {
  return position.includes('bottom') ? slideInBottom : slideInTop;
};

const ToastWrapper = styled.div<{ position: string }>`
  position: fixed;
  ${props => positionStyles[props.position] || positionStyles['bottom-right']};
  z-index: 9999;
  animation: ${props => getAnimation(props.position)} 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 20rem;
  width: 100%;
`;

const LoadingWrapper = styled.div<{ position: string }>`
  position: fixed;
  ${props => positionStyles[props.position] || positionStyles['bottom-right']};
  z-index: 9999;
`;

const LoadingToast = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 0;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
`;

export const ToastContainer: React.FC<ToastContainerProps> = ({ userId, position = 'bottom-right' }) => {
  const { data: unreadNotifications = [], isLoading, error } = useUnreadNotifications(userId);
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationData[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [newNotifications, setNewNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (unreadNotifications.length > 0) {
      const unseenNotifications = unreadNotifications.filter(
        n => !dismissedIds.has(n.notificationId)
      );
      setNewNotifications(unseenNotifications);
    }
  }, [unreadNotifications, dismissedIds]);

  useEffect(() => {
    if (newNotifications.length > 0) {
      setVisibleNotifications(newNotifications);
    }
  }, [newNotifications]);

  const handleDismiss = (notificationId: string) => {
    setDismissedIds(prev => new Set([...prev, notificationId]));
    setVisibleNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
  };

  if (isLoading) {
    return (
      <LoadingWrapper position={position}>
        <LoadingToast>Loading notifications...</LoadingToast>
      </LoadingWrapper>
    );
  }

  if (error || visibleNotifications.length === 0) {
    return null;
  }

  return (
    <ToastWrapper position={position}>
      {visibleNotifications.map((notification) => (
        <ToastNotification
          key={notification.notificationId}
          notification={notification}
          onDismiss={() => handleDismiss(notification.notificationId)}
        />
      ))}
    </ToastWrapper>
  );
};