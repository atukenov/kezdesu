export interface MessageModel {
  text: string;
  userId: string;
  userName: string;
  userImage?: string;
  timestamp: number;
  reactions?: { [emoji: string]: string[] }; // emoji to array of user IDs
}

// Helper to convert Firestore data to MessageModel
export function toMessageModel(
  data: any,
  id?: string
): MessageModel & { id?: string } {
  return {
    id,
    text: data.text,
    userId: data.userId,
    userName: data.userName,
    userImage: data.userImage,
    timestamp: data.timestamp,
    reactions: data.reactions || {},
  };
}
