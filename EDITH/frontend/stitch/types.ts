
export type ViewType = 
  | 'Dashboard' 
  | 'CodeDomain' 
  | 'Performance' 
  | 'ShowWork' 
  | 'AskEdith' 
  | 'HRDomain' 
  | 'Team'
  | 'Settings' 
  | 'Notifications' 
  | 'HelpCenter' 
  | 'Projects' 
  | 'Analytics';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: {
    title: string;
    path: string;
    type: 'code' | 'doc';
  }[];
}

export interface Node {
  id: string;
  label: string;
  type: 'file' | 'folder' | 'service';
  x: number;
  y: number;
  status?: 'active' | 'warning' | 'error';
}

export interface Link {
  source: string;
  target: string;
}
