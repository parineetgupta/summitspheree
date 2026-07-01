import { db } from "./config";
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { Expedition, UserProfile } from "@/types";

const EXPEDITIONS_COLLECTION = "expeditions";
const PROFILES_COLLECTION = "profiles";

// EXPEDITIONS API
export const getExpeditions = async (userId: string): Promise<Expedition[]> => {
  try {
    const q = query(
      collection(db, EXPEDITIONS_COLLECTION),
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expedition));
    
    // Sort client-side to avoid requiring a Firestore composite index
    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error fetching expeditions:", error);
    return [];
  }
};

export const getExpeditionById = async (id: string): Promise<Expedition | null> => {
  const docRef = doc(db, EXPEDITIONS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Expedition;
  }
  return null;
};

export const createExpedition = async (data: Omit<Expedition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, EXPEDITIONS_COLLECTION), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return docRef.id;
};

export const updateExpedition = async (id: string, data: Partial<Expedition>): Promise<void> => {
  const docRef = doc(db, EXPEDITIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now()
  });
};

export const deleteExpedition = async (id: string): Promise<void> => {
  const docRef = doc(db, EXPEDITIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

// USER PROFILES API
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const q = query(collection(db, PROFILES_COLLECTION), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return { id: docData.id, ...docData.data() } as UserProfile;
  }
  return null;
};

export const createUserProfile = async (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, PROFILES_COLLECTION), {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  return docRef.id;
};

export const updateUserProfile = async (id: string, data: Partial<UserProfile>): Promise<void> => {
  const docRef = doc(db, PROFILES_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now()
  });
};

export const getUserIdByUsername = async (username: string): Promise<string | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username.toLowerCase()));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return snapshot.docs[0].id; // The document ID is the user UID
  }
  return null;
};

export const getUsernameByUserId = async (userId: string): Promise<string | null> => {
  const docRef = doc(db, "users", userId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists() && snapshot.data().username) {
    return snapshot.data().username;
  }
  return null;
};
