/**
 * 用户认证服务
 * 处理用户注册、登录、登出等操作
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface AuthUser {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: AuthUser;
}

/**
 * 用户注册
 */
export const register = async (
    email: string,
    password: string,
    fullName?: string
): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                fullName
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "注册失败");
        }

        const data: AuthResponse = await response.json();

        // 保存 token 到 localStorage
        localStorage.setItem('supabase_token', data.access_token);
        localStorage.setItem('user_email', data.user.email);

        return data;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
};

/**
 * 用户登录
 */
export const login = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "登录失败");
        }

        const data: AuthResponse = await response.json();

        // 保存 token 到 localStorage
        localStorage.setItem('supabase_token', data.access_token);
        localStorage.setItem('user_email', data.user.email);

        return data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
    try {
        const token = localStorage.getItem('supabase_token');

        if (token) {
            await fetch(`${BACKEND_URL}/api/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });
        }

        // 清除本地存储
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('user_email');
    } catch (error) {
        console.error("Logout error:", error);
        // 即使登出失败，也清除本地 token
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('user_email');
    }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
    try {
        const token = localStorage.getItem('supabase_token');
        if (!token) {
            return null;
        }

        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            // Token 无效，清除本地存储
            localStorage.removeItem('supabase_token');
            localStorage.removeItem('user_email');
            return null;
        }

        const user: AuthUser = await response.json();
        return user;
    } catch (error) {
        console.error("Get current user error:", error);
        return null;
    }
};

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('supabase_token');
};
