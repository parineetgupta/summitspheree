export type ExpeditionStatus = "draft" | "completed" | "future";

export interface ExpeditionMedia {
  url: string;
  type: "image" | "video";
  id: string;
  title?: string;
  caption?: string;
}

export interface Expedition {
  id?: string;
  userId: string;
  title: string;
  mountain: string;
  location: string;
  date: string;
  elevation: number;
  distance: number;
  duration: number; // in days
  conditions: string;
  journal: string;
  equipment: string;
  favoriteMoment: string;
  biggestChallenge?: string;
  bestPhotoId?: string;
  achievement?: string;
  tags: string[];
  heroImage: string;
  media: ExpeditionMedia[];
  status: ExpeditionStatus;
  visibility?: "public" | "private";
  
  // Future planning fields
  difficulty?: string;
  priority?: "low" | "medium" | "high";
  checklist?: string;
  
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id?: string;
  userId: string;
  displayName: string;
  bio: string;
  profilePhoto: string;
  isPublic: boolean;
  username: string;
  createdAt: number;
  updatedAt: number;
}
