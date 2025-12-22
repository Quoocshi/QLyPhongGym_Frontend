export default function ConversationList({ conversations, selectedId, onSelect }) {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Vừa xong';
        } else if (diffInHours < 24) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }
    };

    const sortedConversations = [...conversations].sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || a.createdAt);
        const timeB = new Date(b.lastMessageAt || b.createdAt);
        return timeB - timeA; // Most recent first
    });

    return (
        <div className="conversation-list-container">
            <div className="conversation-list-header">
                <h2>Tin nhắn</h2>
            </div>
            <div className="conversation-list">
                {sortedConversations.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        Chưa có cuộc hội thoại nào
                    </div>
                ) : (
                    sortedConversations.map((conv) => (
                        <div
                            key={conv.conversationId}
                            className={`conversation-item ${selectedId === conv.conversationId ? 'active' : ''
                                } ${conv.status === 'NEW' ? 'unread' : ''}`}
                            onClick={() => onSelect(conv)}
                        >
                            <div className="conversation-customer">
                                <span>{conv.tenKH}</span>
                                <span className={`conversation-status ${conv.status.toLowerCase()}`}>
                                    {conv.status === 'NEW' ? 'Mới' :
                                        conv.status === 'ASSIGNED' ? 'Đã nhận' : conv.status}
                                </span>
                            </div>
                            {conv.assignedToMe && (
                                <div className="conversation-preview">
                                    ✓ Bạn đã nhận cuộc hội thoại này
                                </div>
                            )}
                            <div className="conversation-time">
                                {formatTime(conv.lastMessageAt)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
