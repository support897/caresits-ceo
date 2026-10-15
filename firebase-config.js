// Caresits accounts — Firebase config plug point.
// DORMANT until the Caresits Firebase project exists. The single
// place the project's web config lands; while the fields are empty
// the account layer connects to nothing and the app runs exactly
// as the certified build does today.
// NEVER put keys for any other app here: one project per app.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: "",
};
export const FIREBASE_ON = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);
