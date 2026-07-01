import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTW4fyolcht0a2y1L_9M5hvfn6z8tP2Hg",
  authDomain: "summitsphere-45a0f.firebaseapp.com",
  projectId: "summitsphere-45a0f",
  storageBucket: "summitsphere-45a0f.firebasestorage.app",
  messagingSenderId: "979700035235",
  appId: "1:979700035235:web:043953bbde9ac6084c9916",
  measurementId: "G-FFLFKY94LV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Fetching expeditions...");
  try {
    const snapshot = await getDocs(collection(db, "expeditions"));
    console.log(`Found ${snapshot.docs.length} expeditions`);
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Title: ${data.title}`);
      console.log(`  Status: ${data.status}`);
      console.log(`  Visibility: ${data.visibility}`);
      console.log(`  UserId: ${data.userId}`);
    });
  } catch (err) {
    console.error("Error fetching:", err);
  }
}

check();
