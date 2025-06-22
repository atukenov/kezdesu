export interface UserModel {
  id: string;
  name: string;
  email: string;
  image?: string;
  status: "available" | "busy";
  location?: {
    latitude: number;
    longitude: number;
  };
  bio?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
}

// Helper to convert Firestore data to UserModel
export function toUserModel(data: any): UserModel {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    image: data.image,
    status: data.status,
    location: data.location,
    bio: data.bio,
    social: data.social,
  };
}
