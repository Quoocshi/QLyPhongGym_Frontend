export default function MessageBubble({ message, isOwn }) {
    const { senderName, content, createdAt, senderType } = message;

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    return (
        <div className={`message-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
            <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                {!isOwn && (
                    <div className="message-sender">
                        {senderName}
                        {senderType === 'STAFF' && <span className="staff-badge">Staff</span>}
                    </div>
                )}
                <div className="message-content">{content}</div>
                <div className="message-time">{formatTime(createdAt)}</div>
            </div>
        </div>
    );
}
