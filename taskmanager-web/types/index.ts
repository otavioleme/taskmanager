export interface User {
  name: string;
  email: string;
  token: string;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  order: number;
  boardId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  order: number;
  columnId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskItemId: string;
  userId: string;
  userName: string;
  createdAt: string;
}