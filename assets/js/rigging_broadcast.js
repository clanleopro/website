const ENCRYPTED_KEY = "R1I6S8H1A0D0A1P8I7J5K4L7M3N4O5P6";
const ENCRYPTED_IV = "7832541597RSHBJS";

const params = new URLSearchParams(window.location.search);
const rawBid = params.get("bid");

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    (value || "").trim()
  );
}

function normalizeEncryptedBid(value) {
  if (!value) return "";
  return value.trim().replace(/ /g, "+");
}

function decryptBid(encryptedBid) {
  try {
    if (!encryptedBid) return null;

    const cleanedBid = normalizeEncryptedBid(encryptedBid);

    if (isUuid(cleanedBid)) {
      return cleanedBid;
    }

    if (typeof CryptoJS === "undefined") {
      throw new Error("CryptoJS library not loaded");
    }

    const key = CryptoJS.enc.Utf8.parse(ENCRYPTED_KEY);
    const iv = CryptoJS.enc.Utf8.parse(ENCRYPTED_IV);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cleanedBid),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8).trim();

    console.log("Raw bid from URL:", encryptedBid);
    console.log("Normalized encrypted bid:", cleanedBid);
    console.log("Decrypted bid:", decryptedText);

    if (!decryptedText) {
      throw new Error("Decryption returned empty value");
    }

    return decryptedText;
  } catch (error) {
    console.error("Failed to decrypt bid:", error);
    return null;
  }
}

const bid = rawBid ? decryptBid(rawBid) : null;

const API_BASE = "https://share.clanleo.com/api/v2/broadcast";
const API_URL = bid ? `${API_BASE}/${encodeURIComponent(bid)}` : null;

const state = {
  post: null,
  comments: [],
  isSidebarOpen: false,
  isLoading: false,
  hasLoaded: false,
};

const dom = {
  pageShell: document.getElementById("page-shell"),
  fullPagePlaceholder: document.getElementById("full-page-placeholder"),
  statusBanner: document.getElementById("status-banner"),
  profileImg: document.getElementById("profile-img"),
  username: document.getElementById("username"),
  timeAgo: document.getElementById("time-ago"),
  postText: document.getElementById("post-text"),
  mediaContainer: document.getElementById("media-container"),
  likesCount: document.getElementById("likes-count"),
  commentsCount: document.getElementById("comments-count"),
  commentBtn: document.getElementById("comment-btn"),
  sidebar: document.getElementById("comments-sidebar"),
  sidebarOverlay: document.getElementById("sidebar-overlay"),
  closeSidebarBtn: document.getElementById("close-sidebar"),
  commentsContent: document.getElementById("comments-content"),
  commentsSubtitle: document.getElementById("comments-subtitle"),
  shareBtn: document.getElementById("share-btn"),
};

function showFullPagePlaceholder() {
  dom.pageShell.style.display = "none";
  dom.fullPagePlaceholder.classList.add("show");
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.background = "#fff";
}

function showStatus(message, type = "info") {
  dom.statusBanner.textContent = message;
  dom.statusBanner.className = `status-banner show ${type}`;
}

function hideStatus() {
  dom.statusBanner.className = "status-banner";
  dom.statusBanner.textContent = "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDisplayDate(input) {
  if (!input) return "Unknown date";

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getAvatar(name, photoUrl) {
  if (photoUrl && typeof photoUrl === "string") return photoUrl;
  const safeName = encodeURIComponent(name || "User");
  return `https://ui-avatars.com/api/?name=${safeName}&background=random`;
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return {
      userName: "Unknown User",
      profilePhoto: "",
    };
  }

  const accountType = (user.accountType || "").toUpperCase();

  let displayName = "Unknown User";

  if (accountType === "INDIVIDUAL") {
    displayName = user.userName || user.username || user.name || "Unknown User";
  } else if (accountType === "COMPANY") {
    displayName = user.companyName || user.name || "Unknown Company";
  } else {
    displayName =
      user.userName ||
      user.companyName ||
      user.username ||
      user.name ||
      "Unknown User";
  }

  return {
    userName: displayName,
    profilePhoto: user.profilePhoto || user.photo || user.avatar || "",
  };
}

function normalizeMediaFiles(mediaFiles) {
  if (!Array.isArray(mediaFiles)) return [];

  return mediaFiles
    .filter(Boolean)
    .map((media) => ({
      mediaType: String(media.mediaType || media.type || "").toUpperCase(),
      mediaUrl: media.mediaUrl || media.url || "",
    }))
    .filter((item) => item.mediaUrl);
}

function normalizeComments(comments) {
  if (!Array.isArray(comments)) return [];

  return comments
    .filter(Boolean)
    .map((comment, index) => {
      const user = normalizeUser(comment.user || comment.createdBy || comment.author);

      return {
        id: comment.commentId || comment.id || `comment-${index}`,
        text: comment.comment || comment.text || comment.message || "",
        createdAt: comment.createdAt || comment.updatedAt || null,
        user,
      };
    });
}

function normalizePost(rawPost) {
  if (!rawPost || typeof rawPost !== "object") {
    throw new Error("Invalid post payload");
  }

  return {
    id: rawPost.postId || rawPost.id || "",
    heading: rawPost.heading || "",
    caption: rawPost.caption || "",
    createdAt: rawPost.createdAt || null,
    views: Number(rawPost.views || rawPost.likes || 0),
    user: normalizeUser(rawPost.user),
    mediaFiles: normalizeMediaFiles(rawPost.mediaFiles),
    comments: normalizeComments(rawPost.comments),
  };
}

function renderPost(post) {
  dom.profileImg.src = getAvatar(post.user.userName, post.user.profilePhoto);
  dom.profileImg.alt = `${post.user.userName} profile image`;
  dom.username.textContent = post.user.userName;
  dom.timeAgo.textContent = `${formatDisplayDate(post.createdAt)} • 🌍`;

  const headingHtml = post.heading
    ? `<span class="post-heading">${escapeHtml(post.heading)}</span>`
    : "";

  const captionHtml = post.caption ? escapeHtml(post.caption) : "";

  dom.postText.innerHTML = `${headingHtml}${captionHtml}`;

  renderMedia(post.mediaFiles);

  dom.likesCount.textContent = String(post.views || 0);
  dom.commentsCount.textContent = String(post.comments.length);
  dom.commentsSubtitle.textContent = `${post.comments.length} comment${post.comments.length === 1 ? "" : "s"}`;
}

function initCarousel(carouselElement) {
  if (!carouselElement) return;

  const track = carouselElement.querySelector(".carousel-track");
  const items = carouselElement.querySelectorAll(".carousel-item");
  const dots = carouselElement.querySelectorAll(".dot");
  const prevBtn = carouselElement.querySelector(".nav.left");
  const nextBtn = carouselElement.querySelector(".nav.right");

  if (!track || !items.length) return;

  let index = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      index = (index + 1) % items.length;
      updateCarousel();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      index = (index - 1 + items.length) % items.length;
      updateCarousel();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      index = Number(dot.dataset.index || 0);
      updateCarousel();
    });
  });

  updateCarousel();
}

function renderMedia(mediaFiles) {
  dom.mediaContainer.innerHTML = "";

  if (!mediaFiles.length) {
    dom.mediaContainer.classList.add("hidden");
    return;
  }

  dom.mediaContainer.classList.remove("hidden");

  if (mediaFiles.length === 1) {
    const media = mediaFiles[0];

    if (media.mediaType === "VIDEO") {
      dom.mediaContainer.innerHTML = `
        <video class="post-media" controls playsinline>
          <source src="${escapeHtml(media.mediaUrl)}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      dom.mediaContainer.innerHTML = `
        <img class="post-media" src="${escapeHtml(media.mediaUrl)}" alt="Broadcast media" />
      `;
    }

    return;
  }

  dom.mediaContainer.innerHTML = `
    <div class="carousel">
      <div class="carousel-track">
        ${mediaFiles
          .map((media) => {
            if (media.mediaType === "VIDEO") {
              return `
                <video class="carousel-item" controls playsinline>
                  <source src="${escapeHtml(media.mediaUrl)}" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              `;
            }

            return `
              <img
                class="carousel-item"
                src="${escapeHtml(media.mediaUrl)}"
                alt="Broadcast media"
              />
            `;
          })
          .join("")}
      </div>

      <button class="nav left" type="button" aria-label="Previous media">&#10094;</button>
      <button class="nav right" type="button" aria-label="Next media">&#10095;</button>

      <div class="dots">
        ${mediaFiles
          .map((_, i) => `<span class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></span>`)
          .join("")}
      </div>
    </div>
  `;

  const carouselElement = dom.mediaContainer.querySelector(".carousel");
  initCarousel(carouselElement);
}

function renderComments() {
  const comments = state.comments;
  dom.commentsSubtitle.textContent = `${comments.length} comment${comments.length === 1 ? "" : "s"}`;

  if (!comments.length) {
    dom.commentsContent.className = "empty-state";
    dom.commentsContent.textContent = "No comments yet.";
    return;
  }

  const list = document.createElement("div");
  list.className = "comment-list";

  comments.forEach((comment) => {
    const card = document.createElement("div");
    card.className = "comment-card";

    const avatar = getAvatar(comment.user.userName, comment.user.profilePhoto);

    card.innerHTML = `
      <div class="comment-header">
        <img
          class="comment-avatar"
          src="${escapeHtml(avatar)}"
          alt="${escapeHtml(comment.user.userName)} avatar"
        />
        <div class="comment-meta">
          <div class="comment-author">${escapeHtml(comment.user.userName)}</div>
          <div class="comment-time">${escapeHtml(formatDisplayDate(comment.createdAt))}</div>
        </div>
      </div>
      <div class="comment-text">${escapeHtml(comment.text || "No comment text")}</div>
    `;

    list.appendChild(card);
  });

  dom.commentsContent.className = "";
  dom.commentsContent.innerHTML = "";
  dom.commentsContent.appendChild(list);
}

function openCommentsSidebar() {
  state.isSidebarOpen = true;
  dom.sidebar.classList.add("open");
  dom.sidebarOverlay.classList.add("show");
  dom.commentBtn.classList.add("active");
  dom.commentBtn.setAttribute("aria-expanded", "true");
  dom.sidebar.setAttribute("aria-hidden", "false");
  dom.sidebarOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderComments();
}

function closeCommentsSidebar() {
  state.isSidebarOpen = false;
  dom.sidebar.classList.remove("open");
  dom.sidebarOverlay.classList.remove("show");
  dom.commentBtn.classList.remove("active");
  dom.commentBtn.setAttribute("aria-expanded", "false");
  dom.sidebar.setAttribute("aria-hidden", "true");
  dom.sidebarOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function fetchBroadcast() {
  if (!rawBid) {
    showFullPagePlaceholder();
    return;
  }

  if (!bid || !API_URL) {
    showStatus("Invalid or unreadable broadcast link.", "error");
    dom.postText.textContent = "Unable to read this broadcast link.";
    dom.username.textContent = "Unavailable";
    dom.timeAgo.textContent = "Invalid bid";
    dom.mediaContainer.classList.add("hidden");
    dom.likesCount.textContent = "0";
    dom.commentsCount.textContent = "0";
    dom.commentsContent.className = "empty-state";
    dom.commentsContent.textContent =
      "Comments are unavailable because the broadcast link could not be decrypted.";
    return;
  }

  state.isLoading = true;
  showStatus("Loading broadcast...", "info");

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("API did not return JSON");
    }

    const data = await response.json();

    if (!data || data.success !== true || !data.post) {
      throw new Error("Broadcast not found or invalid payload");
    }

    const post = normalizePost(data.post);

    state.post = post;
    state.comments = post.comments;
    state.hasLoaded = true;

    renderPost(post);
    hideStatus();
  } catch (error) {
    console.error("Error fetching broadcast:", error);
    showStatus(
      "Failed to load broadcast. Please check the API, CORS, and response format.",
      "error"
    );

    dom.postText.textContent = "Unable to load the broadcast right now.";
    dom.username.textContent = "Unavailable";
    dom.timeAgo.textContent = "Please try again";
    dom.mediaContainer.classList.add("hidden");
    dom.likesCount.textContent = "0";
    dom.commentsCount.textContent = "0";
    dom.commentsContent.className = "empty-state";
    dom.commentsContent.textContent =
      "Comments are unavailable because the broadcast failed to load.";
  } finally {
    state.isLoading = false;
  }
}

async function shareBroadcast() {
  try {
    const currentBid = rawBid || "";

    const shareUrl = currentBid
      ? `https://share.clanleo.com/broadcast/share?bid=${encodeURIComponent(currentBid)}`
      : window.location.href;

    const sharePayload = {
      title: state.post?.heading || "LEO Rigging Calculator Broadcast",
      text: state.post?.caption || "Check out this broadcast",
      url: shareUrl,
    };

    if (navigator.share) {
      await navigator.share(sharePayload);
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    alert("Broadcast link copied to clipboard.");
  } catch (error) {
    console.error("Share failed:", error);
  }
}

// async function shareBroadcast() {
//   try {
//     const sharePayload = {
//       title: state.post?.heading || "Broadcast",
//       text: state.post?.caption || "Check out this broadcast",
//       url: window.location.href,
//     };

//     if (navigator.share) {
//       await navigator.share(sharePayload);
//       return;
//     }

//     await navigator.clipboard.writeText(window.location.href);
//     alert("Broadcast link copied to clipboard.");
//   } catch (error) {
//     console.error("Share failed:", error);
//   }
// }

function bindEvents() {
  dom.commentBtn.addEventListener("click", () => {
    if (!state.hasLoaded) return;
    openCommentsSidebar();
  });

  dom.closeSidebarBtn.addEventListener("click", closeCommentsSidebar);
  dom.sidebarOverlay.addEventListener("click", closeCommentsSidebar);

  dom.shareBtn.addEventListener("click", () => {
    shareBroadcast();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.isSidebarOpen) {
      closeCommentsSidebar();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  fetchBroadcast();
});