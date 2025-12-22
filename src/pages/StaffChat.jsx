import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import ConversationList from '../components/chat/ConversationList';
import StaffChatWindow from '../components/chat/StaffChatWindow';
import websocketService from '../services/websocket';
import { chatService } from '../services/api';
import '../components/chat/chat.css';

export default function StaffChat() {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        initializeChat();
        return () => {
            websocketService.unsubscribe('/topic/staff/new-messages');
        };
    }, []);

    const initializeChat = async () => {
        try {
            // Connect to WebSocket
            const token = localStorage.getItem('auth_token');
            if (!websocketService.isConnected()) {
                await websocketService.connect(token);
                // Wait for STOMP to be fully ready
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            setConnected(true);

            // Load conversations
            await loadConversations();

            // Subscribe to new messages with error handling
            try {
                websocketService.subscribe('/topic/staff/new-messages', (message) => {
                    console.log('[StaffChat] New message notification:', message);
                    // Reload conversations when new message arrives
                    loadConversations();
                });
            } catch (error) {
                console.error('[StaffChat] Failed to subscribe to new messages:', error);
            }

        } catch (error) {
            console.error('[StaffChat] Failed to initialize chat:', error);
            alert('Không thể kết nối đến chat. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
    };

    if (loading) {
        return (
            <div className="staff-chat-page">
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#9ca3af'
                }}>
                    Đang tải...
                </div>
            </div>
        );
    }

    return (
        <div className="staff-chat-page">
            <div className="staff-chat-header-bar">
                <h2>Quản lý Chat</h2>
                <button
                    className="home-button"
                    onClick={() => navigate('/staff/home')}
                    title="Quay về trang chủ"
                >
                    <Home size={20} />
                    <span>Trang chủ</span>
                </button>
            </div>
            <div className="staff-chat-content">
                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?.conversationId}
                    onSelect={handleSelectConversation}
                />
                <div className="staff-chat-window-container">
                    {selectedConversation ? (
                        <StaffChatWindow
                            conversation={selectedConversation}
                            onClose={() => setSelectedConversation(null)}
                        />
                    ) : (
                        <div className="staff-chat-empty">
                            Chọn một cuộc hội thoại để bắt đầu
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
