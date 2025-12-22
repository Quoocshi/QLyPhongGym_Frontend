import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import CustomerChatWindow from './CustomerChatWindow';
import './chat.css';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const handleToggle = () => {
        if (isMinimized) {
            setIsMinimized(false);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && !isMinimized && (
                <CustomerChatWindow
                    onClose={handleClose}
                    onMinimize={handleMinimize}
                />
            )}

            {/* Chat Bubble Button */}
            <button
                onClick={handleToggle}
                className="chat-bubble"
                title="Chat với hỗ trợ"
            >
                {isOpen && !isMinimized ? (
                    <X size={24} />
                ) : (
                    <MessageCircle size={24} />
                )}
                {/* Notification badge (optional - can be added later) */}
                {/* <span className="chat-badge">3</span> */}
            </button>
        </>
    );
}
