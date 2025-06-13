export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  status: "available" | "busy";
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Meetup {
  id: string;
  title: string;
  description?: string;
  location: string;
  time: Date;
  creatorId: string;
  creator: User;
  isPublic: boolean;
  imageUrl?: string;
  participants: User[];
  maxParticipants?: number;
  status: "active" | "cancelled" | "completed";
}
