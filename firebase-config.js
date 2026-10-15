// Caresits accounts — Firebase config plug point.
// LIVE: the Caresits production project (caresits-812a0), created
// in Ilse's signed-in session via PB's chair, 15 Oct 2026.
// One project per app: never put another app's keys here.
export const firebaseConfig = {
  apiKey: "AIzaSyDbi4vqhN6I7Zz7_-6-ZQSZzd3MnQiYBCE",
  authDomain: "caresits-812a0.firebaseapp.com",
  projectId: "caresits-812a0",
  appId: "1:908064912971:web:88858e5fa8751f66b23fce",
};
export const FIREBASE_ON = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
