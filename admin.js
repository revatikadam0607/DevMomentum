
/*
 * DevMomentum Admin Dashboard
 * Access requires the trusted Firebase custom claim: { admin: true }.
 * Assign claims through a trusted Firebase Admin SDK.
 * Firestore Security Rules must independently enforce authorization.
 */

"use strict";

(() => {
  const $ = (id) => document.getElementById(id);

  const elements = {
    status: $("dashboardStatus"),
    denied: $("accessDenied"),
    deniedMessage: $("accessDeniedMessage"),
    content: $("dashboardContent"),
    refresh: $("refreshButton"),
    period: $("periodFilter"),
    applyFilters: $("applyFilters"),
    totalUsers: $("totalUsers"),
    activeUsers: $("activeUsers"),
    roadmaps: $("roadmapsGenerated"),
    studyHours: $("averageStudyHours"),
    activeCaption: $("activeUsersCaption"),
    roadmapsCaption: $("roadmapsCaption"),
    lastUpdated: $("lastUpdated"),
    domains: $("domainsChart"),
    completion: $("completionChart"),
    academicYears: $("academicYearTable"),
    branches: $("branchTable"),
    quality: $("dataQuality"),
    avatar: $("adminAvatar"),
    mobileMenu: $("mobileMenu"),
    sidebar: $("sidebar")
  };

  let auth = null;
  let db = null;
  let currentAdmin = null;
  let isLoading = false;
  let authUnsubscribe = null;
  let loadRequestId = 0;

  const numberFormatter = new Intl.NumberFormat("en-IN");

  function setStatus(title, message) {
    if (!elements.status) return;

    elements.status.classList.remove("hidden");
    elements.status.replaceChildren();

    const icon = document.createElement("span");
    icon.className = "notice-icon";
    icon.textContent = "i";

    const content = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = title;

    const description = document.createElement("p");
    description.textContent = message;

    content.append(heading, description);
    elements.status.append(icon, content);
  }

  function showDenied(message) {
    currentAdmin = null;
    loadRequestId++;

    elements.content?.classList.add("hidden");
    elements.status?.classList.add("hidden");
    elements.denied?.classList.remove("hidden");

    if (elements.deniedMessage) {
      elements.deniedMessage.textContent = message;
    }

    setLoading(false);
  }

  function showDashboard() {
    elements.denied?.classList.add("hidden");
    elements.status?.classList.add("hidden");
    elements.content?.classList.remove("hidden");
  }

  function setLoading(loading) {
    isLoading = loading;

    if (elements.refresh) {
      elements.refresh.disabled = loading;
      elements.refresh.textContent = loading ? "Loading..." : "↻ Refresh data";
    }

    if (elements.applyFilters) {
      elements.applyFilters.disabled = loading;
    }
  }

  function formatNumber(value) {
    return numberFormatter.format(value);
  }

  function safeText(value, fallback = "Unknown") {
    return typeof value === "string" && value.trim()
      ? value.trim()
      : fallback;
  }

  function makeEmptyState(container, message) {
    if (!container) return;

    container.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.className = "empty-state";
    paragraph.textContent = message;

    container.appendChild(paragraph);
  }

  function makeTable(container, firstColumn, rows) {
    if (!container) return;

    container.replaceChildren();

    if (!rows.length) {
      makeEmptyState(container, "No records available for this metric.");
      return;
    }

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    [firstColumn, "Users"].forEach((label) => {
      const th = document.createElement("th");
      th.textContent = label;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const labelCell = document.createElement("td");
      const countCell = document.createElement("td");

      labelCell.textContent = row.label;
      countCell.textContent = formatNumber(row.count);

      tr.append(labelCell, countCell);
      tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    container.appendChild(table);
  }

  function renderDomainChart(rows) {
    if (!elements.domains) return;

    elements.domains.replaceChildren();

    if (!rows.length) {
      makeEmptyState(
        elements.domains,
        "No domain-selection analytics are available yet."
      );
      return;
    }

    const list = document.createElement("div");
    list.className = "chart-list";

    const maxValue = Math.max(...rows.map((row) => row.count), 1);

    rows.slice(0, 8).forEach((row) => {
      const item = document.createElement("div");
      item.className = "chart-row";

      const top = document.createElement("div");
      top.className = "chart-row-top";

      const label = document.createElement("span");
      label.textContent = row.label;

      const count = document.createElement("strong");
      count.textContent = formatNumber(row.count);

      top.append(label, count);

      const track = document.createElement("div");
      track.className = "progress-track";
      track.setAttribute("aria-label", `${row.label}: ${row.count}`);

      const fill = document.createElement("div");
      fill.className = "progress-fill";
      fill.style.width =
        `${Math.max(0, Math.min(100, (row.count / maxValue) * 100))}%`;

      track.appendChild(fill);
      item.append(top, track);
      list.appendChild(item);
    });

    elements.domains.appendChild(list);
  }

  function renderCompletionChart(rows) {
    if (!elements.completion) return;

    elements.completion.replaceChildren();

    if (!rows.length) {
      makeEmptyState(
        elements.completion,
        "Historical completion trends require timestamped task-completion events."
      );
      return;
    }

    const bars = document.createElement("div");
    bars.className = "completion-bars";

    const maxValue = Math.max(...rows.map((row) => row.count), 1);

    rows.forEach((row) => {
      const day = document.createElement("div");
      day.className = "completion-day";

      const barArea = document.createElement("div");
      barArea.className = "completion-bar-area";

      const bar = document.createElement("div");
      bar.className = "completion-bar";
      bar.style.height = `${Math.max(2, (row.count / maxValue) * 100)}%`;
      bar.title = `${row.label}: ${row.count} completed tasks`;

      const label = document.createElement("span");
      label.textContent = row.label;

      barArea.appendChild(bar);
      day.append(barArea, label);
      bars.appendChild(day);
    });

    elements.completion.appendChild(bars);
  }

  function renderQuality(items) {
    if (!elements.quality) return;

    elements.quality.replaceChildren();

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "quality-row";

      const copy = document.createElement("div");
      copy.className = "quality-copy";

      const heading = document.createElement("strong");
      heading.textContent = item.name;

      const description = document.createElement("p");
      description.textContent = item.description;

      const badge = document.createElement("span");
      badge.className =
        `quality-status ${item.available ? "available" : "missing"}`;
      badge.textContent = item.available ? "Available" : "Not configured";

      copy.append(heading, description);
      row.append(copy, badge);
      elements.quality.appendChild(row);
    });
  }

  function getPeriodBounds() {
    const allowedDays = [7, 30, 90];
    const requestedDays = Number(elements.period?.value || 30);
    const days = allowedDays.includes(requestedDays) ? requestedDays : 30;

    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

    return { days, start, end };
  }

  function timestampToDate(value) {
    if (!value) return null;

    if (typeof value.toDate === "function") {
      const date = value.toDate();
      return Number.isNaN(date.getTime()) ? null : date;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "number" || typeof value === "string") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function isWithinPeriod(value, start, end) {
    const date = timestampToDate(value);
    return Boolean(date && date >= start && date <= end);
  }

  async function readCollection(name) {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }

    const snapshot = await db.collection(name).get();

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    }));
  }

  async function readCollectionSafely(name) {
    try {
      return {
        available: true,
        data: await readCollection(name),
        error: null
      };
    } catch (error) {
      console.warn(`Admin analytics: collection "${name}" unavailable.`, error);

      return {
        available: false,
        data: [],
        error
      };
    }
  }

  function countByField(records, field) {
    const counts = new Map();

    records.forEach((record) => {
      const label = safeText(record[field]);

      if (label !== "Unknown") {
        counts.set(label, (counts.get(label) || 0) + 1);
      }
    });

    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }

  function renderUnavailableMetrics() {
    [
      elements.totalUsers,
      elements.activeUsers,
      elements.roadmaps,
      elements.studyHours
    ].forEach((element) => {
      if (element) element.textContent = "—";
    });

    makeEmptyState(elements.domains, "Domain analytics are not available.");
    makeEmptyState(elements.completion, "Completion history is not available.");
    makeTable(elements.academicYears, "Academic year", []);
    makeTable(elements.branches, "Branch", []);

    renderQuality([
      {
        name: "User profiles",
        description: "Firestore collection: users",
        available: false
      },
      {
        name: "Activity events",
        description: "Firestore collection: activityEvents",
        available: false
      },
      {
        name: "Roadmap generation events",
        description: "Firestore collection: roadmapEvents",
        available: false
      },
      {
        name: "Study sessions",
        description: "Firestore collection: studySessions",
        available: false
      },
      {
        name: "Task completion events",
        description: "Firestore collection: taskCompletionEvents",
        available: false
      }
    ]);
  }

  async function loadAnalytics() {
    if (!currentAdmin || isLoading) return;

    if (!db) {
      setStatus(
        "Firebase is not configured",
        "Configure firebase-config.js and enable Firestore before loading analytics."
      );
      renderUnavailableMetrics();
      return;
    }

    const requestId = ++loadRequestId;

    setLoading(true);
    setStatus("Loading analytics", "Reading available analytics data sources.");

    try {
      const { days, start, end } = getPeriodBounds();

      const [
        usersResult,
        activityResult,
        roadmapResult,
        studyResult,
        completionResult
      ] = await Promise.all([
        readCollectionSafely("users"),
        readCollectionSafely("activityEvents"),
        readCollectionSafely("roadmapEvents"),
        readCollectionSafely("studySessions"),
        readCollectionSafely("taskCompletionEvents")
      ]);

      if (requestId !== loadRequestId || !currentAdmin) return;

      const results = [
        usersResult,
        activityResult,
        roadmapResult,
        studyResult,
        completionResult
      ];

      // Registered profile count and user distributions.
      if (usersResult.available) {
        elements.totalUsers.textContent = formatNumber(usersResult.data.length);

        makeTable(
          elements.academicYears,
          "Academic year",
          countByField(usersResult.data, "academicYear")
        );

        makeTable(
          elements.branches,
          "Branch",
          countByField(usersResult.data, "branch")
        );
      } else {
        elements.totalUsers.textContent = "—";
        makeTable(elements.academicYears, "Academic year", []);
        makeTable(elements.branches, "Branch", []);
      }

      // Active users from timestamped activity events.
      if (activityResult.available) {
        const activeUserIds = new Set();

        activityResult.data.forEach((event) => {
          if (
            typeof event.uid === "string" &&
            event.uid &&
            isWithinPeriod(event.createdAt, start, end)
          ) {
            activeUserIds.add(event.uid);
          }
        });

        elements.activeUsers.textContent = formatNumber(activeUserIds.size);
        elements.activeCaption.textContent = `Unique users in the last ${days} days`;
      } else {
        elements.activeUsers.textContent = "—";
        elements.activeCaption.textContent = "Activity records unavailable";
      }

      // Roadmap generation count and domain preferences.
      if (roadmapResult.available) {
        const periodRoadmaps = roadmapResult.data.filter((event) =>
          isWithinPeriod(event.createdAt, start, end)
        );

        elements.roadmaps.textContent = formatNumber(periodRoadmaps.length);
        elements.roadmapsCaption.textContent = `Generated in the last ${days} days`;

        renderDomainChart(countByField(periodRoadmaps, "domain"));
      } else {
        elements.roadmaps.textContent = "—";
        elements.roadmapsCaption.textContent = "Roadmap records unavailable";
        renderDomainChart([]);
      }

      // Average total study hours per user with a recorded session.
      if (studyResult.available) {
        const sessions = studyResult.data.filter((session) =>
          isWithinPeriod(session.createdAt, start, end)
        );

        const userIds = new Set();
        let totalMinutes = 0;
        let validSessions = true;

        sessions.forEach((session) => {
          const minutes = Number(session.durationMinutes);

          if (
            typeof session.uid !== "string" ||
            !session.uid ||
            session.durationMinutes === null ||
            session.durationMinutes === undefined ||
            !Number.isFinite(minutes) ||
            minutes < 0
          ) {
            validSessions = false;
            return;
          }

          userIds.add(session.uid);
          totalMinutes += minutes;
        });

        if (!validSessions) {
          elements.studyHours.textContent = "—";
        } else if (userIds.size > 0) {
          elements.studyHours.textContent =
            (totalMinutes / 60 / userIds.size).toFixed(1);
        } else {
          elements.studyHours.textContent = "—";
        }
      } else {
        elements.studyHours.textContent = "—";
      }

      // Daily task-completion trend (up to seven days).
      if (completionResult.available) {
        const completedEvents = completionResult.data.filter((event) =>
          isWithinPeriod(event.completedAt, start, end)
        );

        const dailyCounts = new Map();

        completedEvents.forEach((event) => {
          const date = timestampToDate(event.completedAt);
          if (!date) return;

          const key = localDateKey(date);
          dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
        });

        const daysToShow = Math.min(days, 7);
        const trendRows = [];

        for (let offset = daysToShow - 1; offset >= 0; offset--) {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() - offset);

          trendRows.push({
            label: date.toLocaleDateString("en-IN", { weekday: "short" }),
            count: dailyCounts.get(localDateKey(date)) || 0
          });
        }

        renderCompletionChart(trendRows);
      } else {
        renderCompletionChart([]);
      }

      renderQuality([
        {
          name: "User profiles",
          description: "Firestore profile count and academic/branch distribution; not the authoritative Firebase Auth total.",
          available: usersResult.available
        },
        {
          name: "Activity events",
          description: "Distinct active users based on timestamped activity records.",
          available: activityResult.available
        },
        {
          name: "Roadmap generation events",
          description: "Roadmap generation records and domain selections.",
          available: roadmapResult.available
        },
        {
          name: "Study sessions",
          description: "Average recorded study time per user with a session.",
          available: studyResult.available
        },
        {
          name: "Task completion events",
          description: "Timestamped completion records for daily trends.",
          available: completionResult.available
        }
      ]);

      const availableCount = results.filter((result) => result.available).length;

      if (elements.lastUpdated) {
        elements.lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        })}`;
      }

      setStatus(
        availableCount === results.length
          ? "Analytics refreshed"
          : "Partial analytics available",
        `${availableCount} of ${results.length} analytics data sources are accessible. Missing or denied sources are not estimated.`
      );
    } catch (error) {
      if (requestId !== loadRequestId || !currentAdmin) return;

      console.error("Admin analytics failed to load:", error);

      setStatus(
        "Unable to load analytics",
        "Check your Firebase configuration, Firestore permissions, and collection schema."
      );
    } finally {
      if (requestId === loadRequestId) setLoading(false);
    }
  }

  async function verifyAdmin(user) {
    if (!user) {
      showDenied("Sign in through the platform with an authorized administrator account.");
      return;
    }

    currentAdmin = null;
    loadRequestId++;

    elements.content?.classList.add("hidden");
    elements.denied?.classList.add("hidden");

    setStatus(
      "Verifying administrator access",
      "Checking trusted account permissions."
    );

    try {
      const tokenResult = await user.getIdTokenResult(true);

      if (auth?.currentUser?.uid !== user.uid) return;

      if (tokenResult.claims.admin !== true) {
        showDenied("Your account does not have the required administrator permission.");
        return;
      }

      currentAdmin = user;

      if (elements.avatar) {
        elements.avatar.textContent = (user.email || "A").trim().charAt(0).toUpperCase();
      }

      showDashboard();
      await loadAnalytics();
    } catch (error) {
      console.error("Admin authorization check failed:", error);

      if (auth?.currentUser?.uid === user.uid) {
        showDenied("Could not verify administrator permissions. Check your connection and try again.");
      }
    }
  }

  function initializeFirebase() {
    if (
      typeof firebase === "undefined" ||
      !firebase.apps ||
      !firebase.apps.length
    ) {
      showDenied("Firebase is not initialized. Configure firebase-config.js before using the admin dashboard.");
      return;
    }

    try {
      auth = firebase.auth();
      db = firebase.firestore();

      authUnsubscribe = auth.onAuthStateChanged((user) => {
        void verifyAdmin(user);
      });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      showDenied("Firebase initialization failed. Check that Auth, Firestore, and project configuration are enabled.");
    }
  }

  // Dashboard controls.
  elements.refresh?.addEventListener("click", () => {
    if (currentAdmin) void loadAnalytics();
  });

  elements.applyFilters?.addEventListener("click", () => {
    if (currentAdmin) void loadAnalytics();
  });

  elements.period?.addEventListener("change", () => {
    if (currentAdmin) void loadAnalytics();
  });

  // Single-page navigation: Overview only; all dashboard sections stay on this page.
  document.querySelectorAll(".sidebar-nav .nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-nav .nav-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
      elements.sidebar?.classList.remove("open");
      elements.mobileMenu?.setAttribute("aria-expanded", "false");
    });
  });

  // Mobile sidebar toggle.
  elements.mobileMenu?.addEventListener("click", () => {
    const isOpen = elements.sidebar?.classList.toggle("open") || false;
    elements.mobileMenu.setAttribute("aria-expanded", String(isOpen));
  });

  window.addEventListener("pagehide", () => {
    if (typeof authUnsubscribe === "function") authUnsubscribe();
  });

  // Fail closed: analytics stay hidden until admin permission is verified.
  renderUnavailableMetrics();
  initializeFirebase();
})();
