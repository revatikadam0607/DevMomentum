/* =========================================================
   MOMENTUMFORGE — AUTHENTICATION
   Firebase Authentication (compat SDK — plain <script> tags,
   no bundler, matching the rest of this project). Handles:
     - Google Sign-In
     - Email/password sign up + log in
     - "Remember Me" (Firebase session persistence)
     - Gating the app behind a signed-in user
     - Scoping each user's saved tasks to their own account
   See FIREBASE_SETUP.md for the one-time project setup this
   depends on.
========================================================= */

"use strict";

let firebaseApp = null;
let auth = null;
let currentUser = null;
let appHasStarted = false; // guards against calling init() more than once

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */
function initFirebase(){
  // Theme is a UI preference, not account-specific — apply it immediately
  // so the login screen itself respects dark/light mode too, instead of
  // waiting until after sign-in (when init() would otherwise call this).
  initTheme();

  // The "Try demo" button must work even when Firebase isn't configured,
  // so wire it before any early-return path below.
  wireGuestButton();

  if(!window.firebase){
    // Firebase SDK failed to load. The "Try demo" button still works
    // without it, so surface a soft notice rather than hard-blocking.
    showAuthError("Firebase SDK failed to load. Check your internet connection and reload, or use the demo below.");
    return;
  }
  if(!firebaseConfig || firebaseConfig.apiKey === "YOUR_API_KEY"){
    showAuthSetupNotice();
    return;
  }

  firebaseApp = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();

  auth.onAuthStateChanged(handleAuthStateChanged);

  wireAuthForm();
}

/**
 * Single source of truth for "are we logged in". Fires on load
 * (if a remembered session exists), after a successful login/
 * signup, and after sign-out.
 */
async function handleAuthStateChanged(user){
  if(user){
    currentUser = user;
    await migrateLegacyDataIfNeeded(user.uid);
    scopeStorageToUser(user.uid);
    hideAuthOverlay();
    renderUserMenu(user);

    if(!appHasStarted){
      appHasStarted = true;
      document.body.classList.add("app-running"); // hides the floating demo button
      const savedStartDate = localStorage.getItem(startDateKeyFor(user.uid));
      if(savedStartDate){
        window.startMomentumForgeApp(savedStartDate); // defined in script.js
      } else {
        promptForStartDate(user.uid);
      }
    }
  } else {
    currentUser = null;
    appHasStarted = false;
    document.body.classList.remove("app-running"); // re-show the floating demo button
    showAuthOverlay();
  }
}

/**
 * Points the app's existing localStorage persistence at a
 * per-user key, so two different accounts on the same browser
 * never see each other's tasks/notes/streaks.
 *
 * NOTE: this reassigns the same `STORAGE_KEY` variable declared
 * with `let` in script.js — classic (non-module) <script> tags
 * share one global scope, so this works as long as script.js has
 * already loaded (it's included before auth.js in index.html).
 * `window.STORAGE_KEY = ...` would NOT work here since `let`/`const`
 * globals aren't attached to `window` the way `var` is.
 */
function scopeStorageToUser(uid){
  STORAGE_KEY = `momentumForgeState_v1_${uid}`;
}

/**
 * If this browser has pre-login data saved under the old,
 * un-scoped key (from testing before auth existed), copy it
 * into this user's own key the first time they sign in — so
 * nobody loses progress just because login got added later.
 */
async function migrateLegacyDataIfNeeded(uid){
  const scopedKey = `momentumForgeState_v1_${uid}`;
  const legacyKey = "momentumForgeState_v1";
  try{
    if(!localStorage.getItem(scopedKey) && localStorage.getItem(legacyKey)){
      localStorage.setItem(scopedKey, localStorage.getItem(legacyKey));
    }
  }catch(e){ console.warn("Legacy data migration skipped:", e); }
}

/* ---------------------------------------------------------
   OVERLAY VISIBILITY
--------------------------------------------------------- */
function showAuthOverlay(){
  document.getElementById("authOverlay").classList.add("open");
  document.body.classList.add("app-locked");
}
function hideAuthOverlay(){
  document.getElementById("authOverlay").classList.remove("open");
  document.body.classList.remove("app-locked");
}

function showAuthSetupNotice(){
  const box = document.getElementById("authErrorBox");
  box.hidden = false;
  box.innerHTML = `<strong>Firebase isn't configured yet.</strong> Open <code>firebase-config.js</code> and fill in your project's values — see <code>FIREBASE_SETUP.md</code> for step-by-step instructions.`;
  document.getElementById("authOverlay").classList.add("open");
  document.body.classList.add("app-locked");
}

function showAuthError(message){
  const box = document.getElementById("authErrorBox");
  box.hidden = false;
  box.textContent = message;
  // Ensure the gate is actually visible — some callers (e.g. the
  // Firebase-not-loaded path) only need the message, but without
  // opening the overlay the whole card — including the demo button —
  // stays hidden behind opacity:0.
  document.getElementById("authOverlay").classList.add("open");
  document.body.classList.add("app-locked");
}
function clearAuthError(){
  const box = document.getElementById("authErrorBox");
  box.hidden = true;
  box.textContent = "";
}

/* ---------------------------------------------------------
   FRIENDLY ERROR MESSAGES
--------------------------------------------------------- */
function friendlyAuthError(err){
  const map = {
    "auth/email-already-in-use": "That email already has an account — try logging in instead.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts — please wait a moment and try again.",
    "auth/network-request-failed": "Network error — check your connection and try again.",
    "auth/unauthorized-domain": "This domain isn't authorized for Google Sign-In yet. Add it under Firebase Console → Authentication → Settings → Authorized domains.",
    "auth/popup-closed-by-user": null, // not a real error — user just closed the popup
  };
  if(err.code === "auth/popup-closed-by-user") return null;
  return map[err.code] || err.message || "Something went wrong — please try again.";
}

/* ---------------------------------------------------------
   FORM WIRING
--------------------------------------------------------- */
let authMode = "login"; // "login" | "signup"

function wireAuthForm(){
  const form = document.getElementById("authForm");
  const modeToggle = document.getElementById("authModeToggle");
  const nameField = document.getElementById("authNameField");
  const submitBtn = document.getElementById("authSubmitBtn");
  const title = document.getElementById("authTitle");
  const googleBtn = document.getElementById("googleSignInBtn");
  const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

  function setMode(mode){
    authMode = mode;
    clearAuthError();
    if(mode === "signup"){
      nameField.hidden = false;
      submitBtn.textContent = "Create Account";
      title.textContent = "Create your account";
      modeToggle.innerHTML = `Already have an account? <button type="button" id="authModeBtn">Log in</button>`;
    } else {
      nameField.hidden = true;
      submitBtn.textContent = "Log In";
      title.textContent = "Welcome back";
      modeToggle.innerHTML = `Don't have an account? <button type="button" id="authModeBtn">Sign up</button>`;
    }
    document.getElementById("authModeBtn").addEventListener("click", ()=> setMode(mode === "signup" ? "login" : "signup"));
  }
  setMode("login");
  wireGuestButton();

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    clearAuthError();

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const name = document.getElementById("authName").value.trim();
    const rememberMe = document.getElementById("authRememberMe").checked;

    submitBtn.disabled = true;
    submitBtn.textContent = authMode === "signup" ? "Creating account…" : "Logging in…";

    try{
      await auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);

      if(authMode === "signup"){
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        if(name) await cred.user.updateProfile({ displayName: name });
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
      // onAuthStateChanged picks up from here
    }catch(err){
      const msg = friendlyAuthError(err);
      if(msg) showAuthError(msg);
      submitBtn.disabled = false;
      submitBtn.textContent = authMode === "signup" ? "Create Account" : "Log In";
    }
  });

  googleBtn.addEventListener("click", async ()=>{
    clearAuthError();
    const rememberMe = document.getElementById("authRememberMe").checked;
    googleBtn.disabled = true;
    try{
      await auth.setPersistence(rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
    }catch(err){
      const msg = friendlyAuthError(err);
      if(msg) showAuthError(msg);
    }
    googleBtn.disabled = false;
    forgotPasswordBtn.addEventListener("click", async ()=>{
    clearAuthError();

    const email = document.getElementById("authEmail").value.trim();

    if(!email){
        showAuthError("Please enter your email address first.");
        return;
    }

    forgotPasswordBtn.disabled = true;
    forgotPasswordBtn.textContent = "Sending...";

    try{
        await auth.sendPasswordResetEmail(email);
        showAuthError("Password reset link sent! Please check your email.");
    }catch(err){
        const msg = friendlyAuthError(err);
        if(msg) showAuthError(msg);
    }

    forgotPasswordBtn.disabled = false;
    forgotPasswordBtn.textContent = "Forgot Password?";
});
  });
}

/* ---------------------------------------------------------
   ROLE-BASED ACCESS CONTROL (RBAC)
   Roles:
     - "user": Standard learner (access to own profile, roadmap, tasks, progress, preferences)
     - "admin": Platform administrator (access to platform config, aggregated analytics, system controls)
--------------------------------------------------------- */
const ROLES = {
  USER: "user",
  ADMIN: "admin"
};

const DEFAULT_ADMIN_EMAILS = [
  "admin@devmomentum.org",
  "admin@momentumforge.app"
];

function getRoleStorageKey(uid){
  const activeUser = (typeof currentUser !== "undefined" && currentUser) || (typeof window !== "undefined" && window.currentUser);
  return `devmomentum_role_${uid || (activeUser ? activeUser.uid : "guest")}`;
}

function getCurrentUserRole(){
  const activeUser = (typeof currentUser !== "undefined" && currentUser) || (typeof window !== "undefined" && window.currentUser);
  const uid = activeUser ? activeUser.uid : "guest";
  const stored = localStorage.getItem(getRoleStorageKey(uid));
  if(stored === ROLES.ADMIN || stored === ROLES.USER){
    return stored;
  }
  // Automatic admin role assignment for recognized admin email addresses
  if(activeUser && activeUser.email && DEFAULT_ADMIN_EMAILS.includes(activeUser.email.toLowerCase())){
    return ROLES.ADMIN;
  }
  return ROLES.USER;
}

function setCurrentUserRole(role){
  if(role !== ROLES.ADMIN && role !== ROLES.USER) return;
  const activeUser = (typeof currentUser !== "undefined" && currentUser) || (typeof window !== "undefined" && window.currentUser);
  const uid = activeUser ? activeUser.uid : "guest";
  localStorage.setItem(getRoleStorageKey(uid), role);
  if(activeUser && activeUser.email !== "guest@local"){
    renderUserMenu(activeUser);
  } else {
    renderUserMenu({ displayName: "Guest Learner", email: "guest@local" });
  }
  updateAdminUI();
  if(typeof showToast === "function"){
    showToast(`Role switched to ${role === ROLES.ADMIN ? "Admin" : "User (Learner)"}`, "success");
  }
}

function isAdmin(){
  return getCurrentUserRole() === ROLES.ADMIN;
}

function hasRole(role){
  return getCurrentUserRole() === role;
}

function verifyRole(requiredRole, onAuthorized, onUnauthorized){
  if(getCurrentUserRole() === requiredRole){
    if(typeof onAuthorized === "function") return onAuthorized();
    return true;
  }
  if(typeof onUnauthorized === "function"){
    return onUnauthorized();
  } else {
    showUnauthorizedModal("Restricted Resource", `This action requires ${requiredRole.toUpperCase()} privileges.`);
    return false;
  }
}

function guardAdminAction(actionName, callback){
  if(isAdmin()){
    if(typeof callback === "function") callback();
    return true;
  }
  showUnauthorizedModal(actionName, "Only users with the Administrator role can access this resource.");
  return false;
}

function showUnauthorizedModal(actionName = "Admin Feature", message = ""){
  const overlay = document.getElementById("unauthorizedModalOverlay");
  if(!overlay) return;
  const titleEl = document.getElementById("unauthorizedModalTitle");
  const descEl = document.getElementById("unauthorizedModalDesc");
  const roleEl = document.getElementById("unauthorizedCurrentRole");

  if(titleEl) titleEl.textContent = `403 Forbidden: ${actionName}`;
  if(descEl && message) descEl.textContent = message;
  if(roleEl) roleEl.textContent = getCurrentUserRole().toUpperCase();

  if(typeof openModal === "function"){
    openModal("unauthorizedModalOverlay");
  } else {
    overlay.classList.add("open");
  }
}

function openAdminPortal(){
  if(!isAdmin()){
    showUnauthorizedModal("Admin Portal", "Regular users cannot access the platform administrator dashboard.");
    return;
  }
  renderAdminPortalData();
  if(typeof openModal === "function"){
    openModal("adminModalOverlay");
  } else {
    document.getElementById("adminModalOverlay")?.classList.add("open");
  }
}

function renderAdminPortalData(){
  const maintenanceSaved = localStorage.getItem("devmomentum_platform_maintenance") === "true";
  const rateLimitSaved = localStorage.getItem("devmomentum_api_ratelimit") || "120";
  const targetHoursSaved = localStorage.getItem("devmomentum_default_target_hours") || "2";

  const mToggle = document.getElementById("adminMaintenanceToggle");
  const rSelect = document.getElementById("adminRateLimitSelect");
  const tInput = document.getElementById("adminTargetHoursInput");

  if(mToggle) mToggle.checked = maintenanceSaved;
  if(rSelect) rSelect.value = rateLimitSaved;
  if(tInput) tInput.value = targetHoursSaved;
}

function updateAdminUI(){
  const role = getCurrentUserRole();
  const badgeEl = document.getElementById("settingsRoleBadge");
  const roleTextEl = document.getElementById("settingsActiveRoleText");
  const quickToggleBtn = document.getElementById("toggleRoleQuickBtn");

  if(badgeEl){
    badgeEl.textContent = role === ROLES.ADMIN ? "Admin" : "Learner";
    badgeEl.className = `role-badge ${role === ROLES.ADMIN ? "role-badge-admin" : "role-badge-user"}`;
  }
  if(roleTextEl){
    roleTextEl.textContent = role === ROLES.ADMIN ? "Administrator" : "User (Learner)";
  }
  if(quickToggleBtn){
    quickToggleBtn.textContent = role === ROLES.ADMIN ? "Switch to User Role" : "Switch to Admin Role";
  }
}

function wireAdminControls(){
  // Settings card trigger
  const settingsAdminBtn = document.getElementById("openAdminPortalFromSettingsBtn");
  if(settingsAdminBtn && !settingsAdminBtn.dataset.wired){
    settingsAdminBtn.dataset.wired = "1";
    settingsAdminBtn.addEventListener("click", ()=>{
      guardAdminAction("Admin Portal", openAdminPortal);
    });
  }

  const quickToggleBtn = document.getElementById("toggleRoleQuickBtn");
  if(quickToggleBtn && !quickToggleBtn.dataset.wired){
    quickToggleBtn.dataset.wired = "1";
    quickToggleBtn.addEventListener("click", ()=>{
      const nextRole = isAdmin() ? ROLES.USER : ROLES.ADMIN;
      setCurrentUserRole(nextRole);
    });
  }

  // Unauthorized modal close / confirm buttons
  const unauthClose = document.getElementById("unauthorizedModalClose");
  const unauthConfirm = document.getElementById("unauthorizedConfirmBtn");
  if(unauthClose && !unauthClose.dataset.wired){
    unauthClose.dataset.wired = "1";
    unauthClose.addEventListener("click", ()=> {
      if(typeof closeModal === "function") closeModal("unauthorizedModalOverlay");
      else document.getElementById("unauthorizedModalOverlay")?.classList.remove("open");
    });
  }
  if(unauthConfirm && !unauthConfirm.dataset.wired){
    unauthConfirm.dataset.wired = "1";
    unauthConfirm.addEventListener("click", ()=> {
      if(typeof closeModal === "function") closeModal("unauthorizedModalOverlay");
      else document.getElementById("unauthorizedModalOverlay")?.classList.remove("open");
    });
  }

  // Admin modal close
  const adminClose = document.getElementById("adminModalClose");
  if(adminClose && !adminClose.dataset.wired){
    adminClose.dataset.wired = "1";
    adminClose.addEventListener("click", ()=> {
      if(typeof closeModal === "function") closeModal("adminModalOverlay");
      else document.getElementById("adminModalOverlay")?.classList.remove("open");
    });
  }

  // Admin tabs
  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    if(!btn.dataset.wired){
      btn.dataset.wired = "1";
      btn.addEventListener("click", ()=>{
        document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        const targetId = `adminTab-${btn.dataset.adminTab}`;
        document.getElementById(targetId)?.classList.add("active");
      });
    }
  });

  // Admin config save
  const configForm = document.getElementById("adminConfigForm");
  if(configForm && !configForm.dataset.wired){
    configForm.dataset.wired = "1";
    configForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      if(!isAdmin()){
        showUnauthorizedModal("Save Configuration", "Only administrators can modify platform configuration.");
        return;
      }
      const mToggle = document.getElementById("adminMaintenanceToggle");
      const rSelect = document.getElementById("adminRateLimitSelect");
      const tInput = document.getElementById("adminTargetHoursInput");

      if(mToggle) localStorage.setItem("devmomentum_platform_maintenance", mToggle.checked ? "true" : "false");
      if(rSelect) localStorage.setItem("devmomentum_api_ratelimit", rSelect.value);
      if(tInput) localStorage.setItem("devmomentum_default_target_hours", tInput.value);

      if(typeof showToast === "function") showToast("Platform configuration saved successfully!", "success");
    });
  }

  // Clear system cache button
  const clearCacheBtn = document.getElementById("clearSystemCacheBtn");
  if(clearCacheBtn && !clearCacheBtn.dataset.wired){
    clearCacheBtn.dataset.wired = "1";
    clearCacheBtn.addEventListener("click", ()=>{
      if(!isAdmin()){
        showUnauthorizedModal("Clear System Cache", "Only administrators can perform system maintenance.");
        return;
      }
      if(typeof showToast === "function") showToast("System cache purged successfully.", "success");
    });
  }

  updateAdminUI();
}

// Expose RBAC utilities globally
window.ROLES = ROLES;
window.getCurrentUserRole = getCurrentUserRole;
window.setCurrentUserRole = setCurrentUserRole;
window.isAdmin = isAdmin;
window.hasRole = hasRole;
window.verifyRole = verifyRole;
window.guardAdminAction = guardAdminAction;
window.openAdminPortal = openAdminPortal;
window.updateAdminUI = updateAdminUI;
window.wireAdminControls = wireAdminControls;

/* ---------------------------------------------------------
   USER MENU (navbar)
--------------------------------------------------------- */
function renderUserMenu(user){
  const wrap = document.getElementById("userMenuWrap");
  if(!wrap) return;
  const initial = (user.displayName || user.email || "?").trim().charAt(0).toUpperCase();
  const label = user.displayName || user.email;
  const role = getCurrentUserRole();
  const roleDisplay = role === ROLES.ADMIN ? "🛡️ Admin" : "Learner";
  const roleBadgeClass = role === ROLES.ADMIN ? "role-badge-admin" : "role-badge-user";

  wrap.innerHTML = `
    <button class="user-avatar-btn" id="userAvatarBtn" aria-label="Account menu" title="${escapeHtmlAttr(label)} (${roleDisplay})">${initial}</button>
    <div class="user-menu-dropdown" id="userMenuDropdown">
      <div class="user-menu-header">
        <div class="user-menu-email">${escapeHtmlAttr(label)}</div>
        <span class="role-badge ${roleBadgeClass}" id="userMenuRoleBadge">${roleDisplay}</span>
      </div>
      ${role === ROLES.ADMIN ? `
        <button class="user-menu-item user-menu-admin-btn" id="menuAdminPortalBtn">
          <svg viewBox="0 0 24 24" width="16" height="16" style="display:inline-block;vertical-align:middle;margin-right:6px;"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/></svg>
          Admin Portal
        </button>
      ` : `
        <button class="user-menu-item" id="menuRegularUserNoticeBtn" style="color:var(--text-muted);font-size:.8rem;">
          <svg viewBox="0 0 24 24" width="14" height="14" style="display:inline-block;vertical-align:middle;margin-right:6px;"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/></svg>
          Learner Account
        </button>
      `}
      <div class="user-menu-role-switch">
        <span class="role-switch-label">Role:</span>
        <button type="button" class="role-switch-btn ${role === ROLES.USER ? 'active' : ''}" id="switchRoleUserBtn">User</button>
        <button type="button" class="role-switch-btn ${role === ROLES.ADMIN ? 'active' : ''}" id="switchRoleAdminBtn">Admin</button>
      </div>
      <button class="user-menu-signout" id="signOutBtn">${currentUser ? "Sign Out" : "Exit Demo"}</button>
    </div>
  `;

  const avatarBtn = document.getElementById("userAvatarBtn");
  const dropdown = document.getElementById("userMenuDropdown");
  avatarBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });
  document.addEventListener("click", ()=> dropdown.classList.remove("open"));

  // Keyboard accessibility: Escape closes dropdown and refocuses avatar button
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape" && dropdown.classList.contains("open")){
      dropdown.classList.remove("open");
      avatarBtn.focus();
    }
  });

  const menuAdminBtn = document.getElementById("menuAdminPortalBtn");
  if(menuAdminBtn){
    menuAdminBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      dropdown.classList.remove("open");
      guardAdminAction("Admin Portal", openAdminPortal);
    });
  }

  const menuNoticeBtn = document.getElementById("menuRegularUserNoticeBtn");
  if(menuNoticeBtn){
    menuNoticeBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      dropdown.classList.remove("open");
      if(typeof showToast === "function") showToast("You are currently viewing as a standard Learner.", "info");
    });
  }

  const switchUserBtn = document.getElementById("switchRoleUserBtn");
  const switchAdminBtn = document.getElementById("switchRoleAdminBtn");
  if(switchUserBtn){
    switchUserBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      setCurrentUserRole(ROLES.USER);
    });
  }
  if(switchAdminBtn){
    switchAdminBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      setCurrentUserRole(ROLES.ADMIN);
    });
  }

  document.getElementById("signOutBtn").addEventListener("click", async ()=>{
    if(auth && currentUser){
      await auth.signOut();
    }
    location.reload();
  });
}

function escapeHtmlAttr(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", ()=>{
  initFirebase();
  wireAdminControls();
});

/* ---------------------------------------------------------
   GUEST / DEMO MODE
   Lets evaluation users try the app without signing in.
   Progress is saved under a fixed guest key on this device;
   signing in later migrates nothing (guest data stays local).
--------------------------------------------------------- */
const GUEST_START_DATE_KEY = "momentumForgeStartDate_v1_guest";

function startGuestMode(){
  // Bypass Firebase entirely — run the app as a local-only user.
  appHasStarted = true;
  hideAuthOverlay();
  document.getElementById("authOverlay").classList.remove("open");
  document.body.classList.remove("app-locked");
  document.body.classList.add("app-running"); // hides the floating demo button

  // Scope localStorage to a guest key so guest data never collides
  // with a signed-in account's data on the same device.
  STORAGE_KEY = "momentumForgeState_v1_guest";

  renderUserMenu({ displayName: "Guest Learner", email: "guest@local" });
  wireAdminControls();

  const chosen = localStorage.getItem(GUEST_START_DATE_KEY);
  if(chosen){
    window.startMomentumForgeApp(chosen);
  } else {
    // First guest run — guide them through picking Day 1, same as a
    // signed-up user, but persist under the guest key afterwards.
    const overlay = document.getElementById("startDateOverlay");
    const form = document.getElementById("startDateForm");
    const input = document.getElementById("startDateInput");
    input.value = toISODate(new Date());
    overlay.classList.add("open");
    document.body.classList.add("app-locked");
    wireStartDatePresets();

    form.addEventListener("submit", function guestOnSubmit(e){
      e.preventDefault();
      const chosenDate = input.value;
      if(!chosenDate) return;
      localStorage.setItem(GUEST_START_DATE_KEY, chosenDate);
      overlay.classList.remove("open");
      document.body.classList.remove("app-locked");
      form.removeEventListener("submit", guestOnSubmit);
      window.startMomentumForgeApp(chosenDate);
    });
  }
}

function wireGuestButton(){
  const btn = document.getElementById("tryDemoBtn");
  const floatBtn = document.getElementById("floatingDemoBtn");

  function handler(){
    clearAuthError();
    startGuestMode();
  }
  // Idempotent — initFirebase() may call this before any early-return,
  // and wireAuthForm() may also reach it on the happy path.
  if(btn){
    if(btn.dataset.guestWired === "1") return;
    btn.dataset.guestWired = "1";
    btn.addEventListener("click", handler);
  }
  if(floatBtn){
    if(floatBtn.dataset.guestWired === "1") return;
    floatBtn.dataset.guestWired = "1";
    floatBtn.addEventListener("click", handler);
  }
}

/* ---------------------------------------------------------
   START DATE MODAL — guided presets
--------------------------------------------------------- */
function wireStartDatePresets(){
  const form = document.getElementById("startDateForm");
  const input = document.getElementById("startDateInput");
  if(!form || !input) return;

  const presets = Array.from(document.querySelectorAll(".startDate-preset"));
  // Guard against double-wiring (this function may be invoked from more
  // than one entry point across the auth/start-date flows).
  if(form.dataset.presetsWired === "1"){
    syncActivePreset(input.value, presets);
    return;
  }
  form.dataset.presetsWired = "1";

  function selectPreset(offsetDays){
    const d = addDays(new Date(), offsetDays);
    input.value = toISODate(d);
    presets.forEach(p=> p.classList.toggle("active", Number(p.dataset.offset) === offsetDays));
  }
  presets.forEach(p=>{
    p.addEventListener("click", ()=> selectPreset(Number(p.dataset.offset)));
  });

  // Only auto-select "today" if the user hasn't already picked a date —
  // otherwise re-entering this modal would wipe a deliberate choice.
  if(!input.value){
    selectPreset(0);
  } else {
    syncActivePreset(input.value, presets);
  }
}

/** Highlight whichever preset matches the currently-selected date, if any. */
function syncActivePreset(value, presets){
  if(!value) return;
  const chosen = new Date(value + "T00:00:00");
  if(isNaN(chosen.getTime())) return;
  const today = new Date(); today.setHours(0,0,0,0);
  const diffDays = Math.round((chosen - today) / 86400000);
  presets.forEach(p=> p.classList.toggle("active", Number(p.dataset.offset) === diffDays));
}

function startDateKeyFor(uid){
  return `momentumForgeStartDate_v1_${uid}`;
}

function promptForStartDate(uid){
  const overlay = document.getElementById("startDateOverlay");
  const form = document.getElementById("startDateForm");
  const input = document.getElementById("startDateInput");
  input.value = toISODate(new Date()); // toISODate lives in script.js, loaded before auth.js
  overlay.classList.add("open");
  document.body.classList.add("app-locked");
  wireStartDatePresets();

  form.addEventListener("submit", function onSubmit(e){
    e.preventDefault();
    const chosen = input.value;
    if(!chosen) return;
    localStorage.setItem(startDateKeyFor(uid), chosen);
    overlay.classList.remove("open");
    document.body.classList.remove("app-locked");
    form.removeEventListener("submit", onSubmit);
    window.startMomentumForgeApp(chosen);
  });
}