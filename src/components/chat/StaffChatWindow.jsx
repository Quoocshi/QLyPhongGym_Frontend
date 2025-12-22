import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import websocketService from '../../services/websocket';
import { chatService } from '../../services/api';
import './chat.css';

export default function StaffChatWindow({ conversation, onClose }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [isAssigned, setIsAssigned] = useState(conversation?.assignedToMe || false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (conversation) {
            loadMessages();
            subscribeToConversation();
        }

        return () => {
            if (conversation) {
                websocketService.unsubscribe(`/topic/conversation/${conversation.conversationId}`);
            }
        };
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const msgs = await chatService.getMessages(conversation.conversationId);
            setMessages(msgs);
        } catch (error) {
            console.error('Failed to load messages:', error);
            alert('Không thể tải tin nhắn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const subscribeToConversation = () => {
        console.log('[StaffChat] Subscribing to conversation:', conversation.conversationId);
        try {
            websocketService.subscribe(`/topic/conversation/${conversation.conversationId}`, (message) => {
                console.log('[StaffChat] Received message:', message);
                setMessages(prev => {
                    // Remove optimistic message if exists
                    const filtered = prev.filter(m => !String(m.messageId || '').startsWith('temp-'));
                    // Avoid duplicates
                    if (filtered.find(m => m.messageId === message.messageId)) {
                        return prev;
                    }
                    return [...filtered, message];
                });
            });
        } catch (error) {
            console.error('[StaffChat] Failed to subscribe:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAssign = async () => {
        try {
            setAssigning(true);
            await chatService.assignConversation(conversation.conversationId);
            setIsAssigned(true);
            alert('Đã nhận cuộc hội thoại thành công!');
        } catch (error) {
            console.error('Failed to assign conversation:', error);
            if (error.response?.status === 400) {
                alert('Cuộc hội thoại đã được nhân viên khác nhận.');
            } else {
                alert('Không thể nhận cuộc hội thoại. Vui lòng thử lại.');
            }
        } finally {
            setAssigning(false);
        }
    };

    const handleSendMessage = async (content) => {
        if (!isAssigned) {
            alert('Bạn cần nhận cuộc hội thoại trước khi gửi tin nhắn.');
            return;
        }

        try {
            // Create optimistic message to show immediately
            const optimisticMessage = {
                messageId: `temp-${Date.now()}`,
                content: content,
                senderType: 'STAFF',
                senderName: 'Bạn',
                createdAt: new Date().toISOString(),
                conversationId: conversation.conversationId
            };

            // Add message to UI immediately for better UX
            setMessages(prev => [...prev, optimisticMessage]);

            // Send via WebSocket
            websocketService.send('/app/chat.staff.send', {
                conversationId: conversation.conversationId,
                content: content
            });

        } catch (error) {
            console.error('[StaffChat] Failed to send message:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => !String(m.messageId || '').startsWith('temp-')));
        }
    };

    if (!conversation) {
        return null;
    }

    return (
        <div className="staff-chat-window">
            <div className="staff-chat-header">
                <div className="staff-chat-customer-info">
                    <h3>{conversation.tenKH}</h3>
                    <p>
                        {conversation.status === 'NEW' ? 'Cuộc hội thoại mới' :
                            conversation.status === 'ASSIGNED' ? 'Đã nhận' : conversation.status}
                    </p>
                </div>
                <div>
                    {!isAssigned && !conversation.assignedToMe && (
                        <button
                            onClick={handleAssign}
                            className="assign-button"
                            disabled={assigning}
                        >
                            {assigning ? 'Đang nhận...' : 'Nhận cuộc hội thoại'}
                        </button>
                    )}
                    {conversation.assignedToMe && (
                        <div className="assigned-info">
                            ✓ Bạn đã nhận cuộc hội thoại này
                        </div>
                    )}
                    {!conversation.assignedToMe && conversation.status === 'ASSIGNED' && (
                        <div className="assigned-info">
                            Đã được nhân viên khác nhận
                        </div>
                    )}
                </div>
            </div>

            <div className="chat-messages">
                {loading && messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>Đang tải tin nhắn...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>Chưa có tin nhắn nào</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.messageId}
                            message={msg}
                            isOwn={msg.senderType === 'STAFF'}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer">
                <MessageInput
                    onSend={handleSendMessage}
                    disabled={!isAssigned || loading}
                    placeholder={
                        isAssigned
                            ? "Nhập tin nhắn..."
                            : "Nhận cuộc hội thoại để gửi tin nhắn..."
                    }
                />
            </div>
        </div>
    );
}
