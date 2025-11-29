// JWT Token helpers
export function parseJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1];
        const json = decodeURIComponent(
            Array.prototype.map
                .call(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (c) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to parse JWT:', e);
        return null;
    }
}

export function getRoleFromToken(token) {
    if (!token) return null;
    
    // Handle mock tokens (they start with 'mock-token-')
    if (token.startsWith('mock-token-')) {
        return 'user'; // Default mock role
    }
    
    const payload = parseJwt(token);
    if (!payload) return null;
    
    // Check various role field names that backend might use
    const roleValue = payload.role || payload.roles || payload.loaiNguoiDung || payload.maLoaiNguoiDung || payload.type;
    
    if (!roleValue) return null;
    
    const roleStr = String(roleValue).toLowerCase();
    
    // Check for trainer keywords
    if (roleStr.includes('trainer') || roleStr.includes('pt') || roleStr === '2') {
        return 'trainer';
    }
    // Check for user keywords
    if (roleStr.includes('user') || roleStr.includes('khach') || roleStr === '1') {
        return 'user';
    }
    
    return null;
}