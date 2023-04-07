export interface Tag {
  id: string;
  name: string;
  icon: string;
}

export interface Post {
  id: string;
  account: string;
  timestamp: string;
  title: string;
  message: string;
  tag: Tag;
  discussion?: Post;
  replies?: { account: string; timestamp: string }[];
}

export interface Posts {
  data: Post;
}

export interface User {
  id: string;
  avatar: string;
}

export interface Users {
  data: User;
}
