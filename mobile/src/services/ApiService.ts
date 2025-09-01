// API service for Hobi-X mobile app
// Connects to the Node.js backend

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface GameScore {
  id: number;
  userId: number;
  gameType: string;
  score: number;
  level: number;
  timeSpent: number;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    // Development URL - change for production
    this.baseURL = 'http://localhost:3000/api/v1';
    // Production URL would be: 'https://your-domain.com/api/v1'
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Game endpoints
  async getGames(): Promise<{ games: string[] }> {
    return this.request('/games');
  }

  async playGame(gameType: string): Promise<{ gameData: any }> {
    return this.request(`/games/${gameType}`, {
      method: 'POST',
    });
  }

  async saveScore(token: string, scoreData: {
    gameType: string;
    score: number;
    level: number;
    timeSpent: number;
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/games/score', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(scoreData),
    });
  }

  // User endpoints
  async getProfile(token: string): Promise<{ user: User }> {
    return this.request('/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getScores(token: string): Promise<{ scores: GameScore[] }> {
    return this.request('/users/scores', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getLeaderboard(gameType?: string): Promise<{ leaderboard: any[] }> {
    const endpoint = gameType ? `/users/leaderboard?game=${gameType}` : '/users/leaderboard';
    return this.request(endpoint);
  }
}

export default new ApiService();
