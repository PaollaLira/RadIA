export type ChatModelMode = 'reasoning' | 'fast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  attachedImage?: boolean;
  imagePreview?: string;
}
