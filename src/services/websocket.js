import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.messageCallbacks = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(token) {
        return new Promise((resolve, reject) => {
            //const API_URL = import.meta.env.VITE_API_URL || '/api';
            const wsUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:8081/ws-chat' 
            : 'https://vina-gym.onrender.com/ws-chat';

            console.log('[WebSocket] Connecting to:', wsUrl);
            console.log('[WebSocket] Token:', token ? 'Present (length: ' + token.length + ')' : 'Missing');

            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },
                debug: (str) => {
                    console.log('[WebSocket Debug]', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('[WebSocket] Connected successfully');
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('[WebSocket] STOMP error:', frame);
                    console.error('[WebSocket] Error details:', {
                        command: frame.command,
                        headers: frame.headers,
                        body: frame.body
                    });
                    this.connected = false;

                    // Không reject ngay, để user có thể thấy lỗi chi tiết
                    // reject(new Error('WebSocket STOMP error: ' + (frame.body || 'Unknown error')));
                },
                onWebSocketError: (error) => {
                    console.error('[WebSocket] WebSocket error:', error);
                    this.connected = false;
                },
                onDisconnect: () => {
                    console.log('[WebSocket] Disconnected');
                    this.connected = false;
                    // Không auto-reconnect nữa, để tránh loop vô hạn
                    // this.handleReconnect(token);
                }
            });

            try {
                this.client.activate();
            } catch (error) {
                console.error('[WebSocket] Failed to activate:', error);
                reject(error);
            }
        });
    }

    handleReconnect(token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => {
                this.connect(token);
            }, 5000);
        } else {
            console.error('[WebSocket] Max reconnect attempts reached');
        }
    }

    disconnect() {
        if (this.client) {
            console.log('[WebSocket] Disconnecting...');
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();
            this.messageCallbacks.clear();
            this.client.deactivate();
            this.connected = false;
        }
    }

    subscribe(destination, callback) {
        if (!this.client || !this.connected) {
            console.error('[WebSocket] Cannot subscribe - not connected');
            return null;
        }

        console.log('[WebSocket] Subscribing to:', destination);

        const subscription = this.client.subscribe(destination, (message) => {
            try {
                const data = JSON.parse(message.body);
                console.log('[WebSocket] Message received from', destination, data);
                callback(data);
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
            }
        });

        this.subscriptions.set(destination, subscription);
        return subscription;
    }

    unsubscribe(destination) {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log('[WebSocket] Unsubscribed from:', destination);
        }
    }

    send(destination, body) {
        if (!this.client || !this.connected) {
            console.error('[WebSocket] Cannot send - not connected');
            throw new Error('WebSocket not connected');
        }

        console.log('[WebSocket] Sending to:', destination, body);
        this.client.publish({
            destination,
            body: JSON.stringify(body)
        });
    }

    isConnected() {
        return this.connected;
    }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
