
export type Role = 'user' | 'model' | 'system';

export interface Message {
  role: Role;
  content: string;
  image?: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
}

export enum TutorMode {
  NORMAL = 'NORMAL',
  DEEP_EXPLAIN = 'DEEP_EXPLAIN'
}
