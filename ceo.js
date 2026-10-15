// Caresits CEO dashboard — pattern v2 instance.
// Reads AGGREGATES ONLY from _owner/aggregates. The owner has no
// read path into user folders, by the rules and by this client:
// it never asks for one. While the Firebase config is empty, or
// no aggregates exist yet, it renders honest zeros.
import { firebaseConfig, FIREBASE_ON } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const SDK = "https://www.gstatic.com/firebasejs/10.12.2";

const AVATARS = [
  { id: "lio", name: "Lio the Lighthouse", img: "lio.png" },
  { id: "bunny", name: "The Caresits Bunny", img: "bunny.png" },
];

function showLocked(text) {
  $("app").hidden = true;
  $("lock").hidden = false;
  if (text) $("lockMsg").textContent = text;
}
function showApp() {
  $("lock").hidden = true;
  $("app").hidden = false;
}

// Sidebar: one section open at a time (her calm law).
document.querySelectorAll("#nav button").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll("#nav button").forEach((x) => x.classList.toggle("on", x === b));
    document.querySelectorAll(".sec").forEach((s) => (s.hidden = s.id !== `sec-${b.dataset.sec}`));
  });
});

function renderAggregates(agg) {
  const people = agg.people || {};
  const money = agg.money || {};
  const reviews = agg.reviews || {};
  const outreach = agg.outreach || {};
  const community = agg.community || {};
  const avatars = agg.avatars || {};

  $("ovJoined").textContent = people.total || 0;
  $("ovPaying").textContent = money.paying || 0;
  $("ovLeaving").textContent = money.cancelsPending || 0;

  const tbody = document.querySelector("#weekTable tbody");
  tbody.innerHTML = "";
  const weeks = Object.keys(people.weekly || {}).sort();
  for (const w of weeks) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${w}</td><td>${people.weekly[w]}</td>`;
    tbody.appendChild(tr);
  }
  if (!weeks.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>No weeks yet</td><td>0</td>`;
    tbody.appendChild(tr);
  }

  $("pTotal").textContent = people.total || 0;
  $("pWeek").textContent = weeks.length ? people.weekly[weeks[weeks.length - 1]] || 0 : 0;
  $("pActive").textContent = people.activatedWithin7d || 0;
  $("pReturn").textContent = people.returning7d || 0;

  $("mPaying").textContent = money.paying || 0;
  $("mPending").textContent = money.cancelsPending || 0;
  $("mEnded").textContent = money.cancelsEnded || 0;
  $("mFailed").textContent = money.failedPayments || 0;
  $("mMrr").textContent = `A$${money.mrrEstimate || 0}`;
  const feed = $("feedList");
  feed.innerHTML = "";
  const events = money.feed || [];
  $("feedEmpty").hidden = events.length > 0;
  for (const e of events.slice(0, 10)) {
    const li = document.createElement("li");
    li.textContent = `${e.kind || "event"} · ${e.plan || ""} · ${e.when || ""}`;
    feed.appendChild(li);
  }

  $("rCount").textContent = reviews.count || 0;
  $("rStrangers").textContent = reviews.strangerReplies || 0;

  if (outreach.running) $("oState").textContent = "Running.";
  $("oSent").textContent = outreach.sent || 0;
  $("oReplies").textContent = outreach.replies || 0;

  const groups = $("groupList");
  groups.innerHTML = "";
  const gs = community.groups || [];
  $("groupEmpty").hidden = gs.length > 0;
  for (const g of gs) {
    const li = document.createElement("li");
    li.textContent = `${g.name} · ${g.members || 0} members · ${g.source || "manual"}`;
    groups.appendChild(li);
  }

  const list = $("avatarList");
  list.innerHTML = "";
  for (const a of AVATARS) {
    const d = avatars[a.id] || {};
    const card = document.createElement("div");
    card.className = "avatarCard";
    card.innerHTML = `<img src="${a.img}" alt=""><div><b>${a.name}</b><br><span class="small">Views ${d.views || 0} · Sales ${d.salesCount || 0} · A$${d.salesAmount || 0}</span></div>`;
    list.appendChild(card);
  }
}

async function boot() {
  renderAggregates({});
  if (!FIREBASE_ON) {
    showLocked("The dashboard is built and waiting for the Caresits account service to go live.");
    return;
  }
  // The door stands from the first paint: the lock holds the sign
  // in button, so it shows before the account service answers.
  showLocked();
  let initializeApp, authMod, fsMod;
  try {
    ({ initializeApp } = await import(`${SDK}/firebase-app.js`));
    authMod = await import(`${SDK}/firebase-auth.js`);
    fsMod = await import(`${SDK}/firebase-firestore.js`);
  } catch (e) {
    showLocked("We could not reach the account service just now. Please check your connection and reload.");
    return;
  }
  const app = initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  const db = fsMod.getFirestore(app);
  $("lockGoogle").onclick = () =>
    authMod.signInWithPopup(auth, new authMod.GoogleAuthProvider()).catch(() => showLocked("That sign in did not work."));
  $("out").onclick = () => authMod.signOut(auth);
  authMod.onAuthStateChanged(auth, async (u) => {
    if (!u) return showLocked();
    try {
      const paths = ["people", "money", "reviews", "outreach", "community", "avatars"];
      const agg = {};
      for (const p of paths) {
        const snap = await fsMod.getDoc(fsMod.doc(db, "_owner", "aggregates", p, "main"));
        agg[p] = snap.exists() ? snap.data() : {};
      }
      renderAggregates(agg);
      showApp();
    } catch (e) {
      // The rules answer a non-owner with a denial; that is the lock working.
      showLocked("This account is not the owner of record.");
    }
  });
}
boot();
