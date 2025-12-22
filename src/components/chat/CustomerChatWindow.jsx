import { useState, useEffect, useRef } from 'react';
import { X, Minimize2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import websocketService from '../../services/websocket';
import { chatService } from '../../services/api';
import './chat.css';

export default function CustomerChatWindow({ onClose, onMinimize }) {
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const accountId = JSON.parse(localStorage.getItem('user'))?.accountId;

    useEffect(() => {
        initializeChat();
        return () => {
            if (conversationId) {
                websocketService.unsubscribe(`/topic/conversation/${conversationId}`);
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!websocketService.isConnected()) {
                await websocketService.connect(token);
            }
            setConnected(true);

            // Wait a bit for STOMP to be fully ready
            await new Promise(resolve => setTimeout(resolve, 500));

            // Try to load existing conversation
            await loadExistingConversation();
        } catch (error) {
            console.error('Failed to connect to chat:', error);
            setConnected(false);
        }
    };

    const loadExistingConversation = async () => {
        try {
            // Try to get conversation from backend
            console.log('[Chat] Fetching customer conversation from backend');
            const conversation = await chatService.getMyConversation();

            // Check if conversationId exists and is valid (not null/undefined/empty)
            if (conversation?.conversationId) {
                console.log('[Chat] Found existing conversation:', conversation.conversationId);
                await loadMessageHistory(conversation.conversationId);
            } else {
                console.log('[Chat] No existing conversation - will create on first message');
                console.log('[Chat] Response from backend:', conversation);
            }
        } catch (error) {
            // Handle errors gracefully - both 404 and 500 mean "no conversation yet"
            const status = error.response?.status;

            if (status === 404) {
                // Expected: no conversation exists yet
                console.log('[Chat] No existing conversation found (404) - will create on first message');
            } else if (status === 500) {
                // Backend error (e.g., null pointer) - treat as no conversation
                console.warn('[Chat] Backend error loading conversation (500) - will create new conversation on first message');
            } else {
                // Other unexpected errors
                console.error('[Chat] Unexpected error loading conversation:', error);
            }

            // In all cases, allow user to send messages - conversation will be created
        }
    };

    const loadMessageHistory = async (convId) => {
        if (!convId) return;

        try {
            setLoadingHistory(true);
            console.log('[Chat] Loading message history for conversation:', convId);

            // Set conversationId FIRST so subscription can happen
            setConversationId(convId);
            localStorage.setItem('lastConversationId', convId);

            const history = await chatService.getMessages(convId);
            console.log('[Chat] Loaded message history:', history);

            if (history && Array.isArray(history)) {
                setMessages(history);
            } else {
                setMessages([]);
            }

            // Subscribe to conversation after loading messages
            if (websocketService.isConnected()) {
                subscribeToConversation(convId);
            }
        } catch (error) {
            console.error('Failed to load message history:', error);
            // If we get 403 or 404, clear the stored conversation
            if (error.response?.status === 403 || error.response?.status === 404) {
                localStorage.removeItem('lastConversationId');
                setConversationId(null);
            }
        } finally {
            setLoadingHistory(false);
        }
    };

    const subscribeToConversation = (convId) => {
        if (!websocketService.isConnected()) {
            console.error('[Chat] Cannot subscribe - not connected');
            return;
        }

        console.log('[Chat] Subscribing to conversation:', convId);
        try {
            websocketService.subscribe(`/topic/conversation/${convId}`, (message) => {
                console.log('[Chat] Received message from topic:', message);
                setMessages(prev => {
                    // Remove optimistic message if exists
                    const filtered = prev.filter(m => !String(m.messageId || '').startsWith('temp-'));
                    // Avoid duplicates
                    if (filtered.find(m => m.messageId === message.messageId)) {
                        return prev;
                    }
                    return [...filtered, message];
                });

                // Set conversationId if not set yet
                if (message.conversationId && !conversationId) {
                    setConversationId(message.conversationId);
                    // Store for next time
                    localStorage.setItem('lastConversationId', message.conversationId);
                }
            });
        } catch (error) {
            console.error('[Chat] Failed to subscribe:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (content) => {
        if (!connected) {
            alert('Chưa kết nối đến server. Vui lòng thử lại.');
            return;
        }

        try {
            setLoading(true);

            // Create optimistic message to show immediately
            const optimisticMessage = {
                messageId: `temp-${Date.now()}`,
                content: content,
                senderType: 'CUSTOMER',
                senderName: 'Bạn',
                createdAt: new Date().toISOString(),
                conversationId: conversationId
            };

            // Add message to UI immediately for better UX
            setMessages(prev => [...prev, optimisticMessage]);

            // Send via WebSocket
            websocketService.send('/app/chat.customer.send', {
                conversationId: conversationId,
                content: content
            });

        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => !String(m.messageId || '').startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    // Subscription is now handled directly in loadMessageHistory
    // to avoid timing issues and duplicate subscriptions

    // Removed: Wrong subscription to staff topic - customers don't need this

    return (
        <div className="chat-window customer-chat">
            <div className="chat-header">
                <div className="chat-header-title">
                    <div className="chat-title">Chat với hỗ trợ</div>
                    <div className="chat-status">
                        {connected ? (
                            <span className="status-online">● Online</span>
                        ) : (
                            <span className="status-offline">● Offline</span>
                        )}
                    </div>
                </div>
                <div className="chat-header-actions">
                    <button onClick={onMinimize} className="icon-button" title="Thu nhỏ">
                        <Minimize2 size={18} />
                    </button>
                    <button onClick={onClose} className="icon-button" title="Đóng">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="chat-messages">
                {loadingHistory ? (
                    <div className="chat-empty">
                        <p>Đang tải tin nhắn...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>Chào bạn! 👋</p>
                        <p>Hãy gửi tin nhắn để bắt đầu trò chuyện với chúng tôi.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <MessageBubble
                            key={msg.messageId || index}
                            message={msg}
                            isOwn={msg.senderType === 'CUSTOMER'}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-footer">
                <MessageInput
                    onSend={handleSendMessage}
                    disabled={!connected || loading}
                    placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                />
            </div>
        </div>
    );
}
