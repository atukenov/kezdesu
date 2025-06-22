import { UserModel } from "./UserModel";

export interface MeetupModel {
  title: string;
  description?: string;
  location: string;
  time: string; // ISO string for Firestore
  creatorId: string;
  creator: UserModel;
  isPublic: boolean;
  imageUrl?: string;
  participants: UserModel[];
  maxParticipants?: number;
  status: "active" | "cancelled" | "completed";
  archived?: boolean;
  categories?: string[]; // categories/tags for filtering/search
  reactions?: { [emoji: string]: string[] }; // emoji to array of user IDs
}

// Helper to convert Firestore data to MeetupModel
export function toMeetupModel(
  data: any,
  id?: string
): MeetupModel & { id?: string } {
  return {
    id,
    title: data.title,
    description: data.description,
    location: data.location,
    time: data.time,
    creatorId: data.creatorId,
    creator: data.creator,
    isPublic: data.isPublic,
    imageUrl: data.imageUrl,
    participants: data.participants || [],
    maxParticipants: data.maxParticipants,
    status: data.status,
    archived: data.archived,
    categories: data.categories || [],
    reactions: data.reactions || {}, // emoji reactions
  };
}
