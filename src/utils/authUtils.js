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
    
    const payload = parseJwt(token);
    if (!payload) return null;
    
    // Backend JWT structure: { roles: ["USER"], sub: "username", accountId: 1, ... }
    const roles = payload.roles || payload.role || [];
    
    if (Array.isArray(roles) && roles.length > 0) {
        return roles[0]; // Return first role: "USER", "TRAINER", "ADMIN", "STAFF"
    }
    
    if (typeof roles === 'string') {
        return roles;
    }
    
    return 'USER'; // Default role
}