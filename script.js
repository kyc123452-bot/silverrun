const assets = "./public/assets/";
document.documentElement.classList.add("js");

const services = [
  {
    image: "gallery-activity-CB4uWo5p.webp",
    title: "스마트 운동재활 서비스",
    description: "슬링, 워킹레일, 순환운동을 활용한 안전한 신체 기능 회복 프로그램",
  },
  {
    image: "service-medical-nursing-20260628.jpg",
    title: "의료·간호 서비스",
    description: "혈압, 당뇨, 투약 관리 등 어르신 건강 상태에 맞춘 세심한 관리",
  },
  {
    image: "ChatGPT-Image-2025년-10월-16일-오후-05_51_02_1760604714476.png",
    title: "인지·정서 지원 서비스",
    description: "치매 예방 활동과 정서적 안정을 돕는 다양한 프로그램",
  },
  {
    image: "service-daily-support-20260628.jpg",
    title: "생활 지원 서비스",
    description: "일상 속 편안함을 위한 맞춤형 지원",
  },
  {
    image: "ChatGPT-Image-2025년-10월-16일-오후-06_04_13_1760605499394.png",
    title: "영양 관리 서비스",
    description: "전문 영양사가 관리하는 균형 잡힌 식단 제공",
  },
];

const pageData = window.SU_DAILY_DATA || {};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderServices() {
  const mount = document.querySelector("[data-services]");
  mount.innerHTML = services
    .map(
      (item) => `
        <article class="service-card">
          <img src="${assets}${encodeURI(item.image)}" alt="${item.title}" loading="lazy" />
          <div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderFacilityInfo() {
  const mount = document.querySelector("[data-facility-info]");
  if (!mount) return;

  mount.innerHTML = (pageData.facilityInfo || [])
    .map(
      (item) => `
        <article class="facility-info-card">
          <h3>${item.label}</h3>
          ${item.sublabel ? `<p>${item.sublabel}</p>` : ""}
          <dl>
            <div><dt>주소</dt><dd>${item.address || "-"}</dd></div>
            <div><dt>전화</dt><dd>${item.phone || "-"}</dd></div>
            ${item.location ? `<div><dt>위치</dt><dd>${item.location}</dd></div>` : ""}
            ${item.parking ? `<div><dt>주차</dt><dd>${item.parking}</dd></div>` : ""}
          </dl>
        </article>
      `,
    )
    .join("");
}

function bindHeader() {
  const header = document.querySelector("[data-header]");
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!header || !button || !menu) return;

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const setMenu = (isOpen, restoreFocus = false) => {
    menu.classList.toggle("open", isOpen);
    header.classList.toggle("menu-open", isOpen);
    document.body.classList.toggle("mobile-menu-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
    if (restoreFocus) button.focus();
  };

  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  button.addEventListener("click", () => {
    setMenu(!menu.classList.contains("open"));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("open")) {
      setMenu(false, true);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760 && menu.classList.contains("open")) setMenu(false);
  });
}

function renderFilterButtons(mount, items, activeCategory) {
  const categories = [...new Set(items.map((item) => item.title || "기타"))];
  mount.innerHTML = categories
    .map(
      (category) => `
        <button type="button" class="${category === activeCategory ? "active" : ""}" data-category="${category}">
          ${category}
        </button>
      `,
    )
    .join("");
  return categories;
}

function renderGallery(mount, items, category) {
  const visibleItems = items.filter((item) => item.title === category && item.image);

  mount.setAttribute("aria-live", "polite");
  mount.setAttribute("aria-label", `${category} 사진`);
  mount.innerHTML = visibleItems
    .map(
      (item) => `
        <figure class="gallery-item">
          <img
            src="${assets}${encodeURI(item.image)}"
            alt="${item.name || item.title} 시설 이미지"
            loading="lazy"
            decoding="async"
          />
          ${item.description ? `<figcaption>${item.description}</figcaption>` : ""}
        </figure>
      `,
    )
    .join("");
}

function bindGallery({ filterSelector, gallerySelector, items }) {
  const filters = document.querySelector(filterSelector);
  const gallery = document.querySelector(gallerySelector);
  if (!filters || !gallery || !items?.length) return;

  let activeCategory = items[0].title || "기타";
  renderFilterButtons(filters, items, activeCategory);
  renderGallery(gallery, items, activeCategory);
  filters.querySelectorAll("button[data-category]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.category === activeCategory));
  });

  let transitionTimer;

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button || button.dataset.category === activeCategory) return;

    activeCategory = button.dataset.category;
    filters.querySelectorAll("button[data-category]").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    window.clearTimeout(transitionTimer);
    gallery.classList.add("is-changing");
    gallery.setAttribute("aria-busy", "true");
    transitionTimer = window.setTimeout(
      () => {
        renderGallery(gallery, items, activeCategory);
        gallery.setAttribute("aria-busy", "false");
        requestAnimationFrame(() => gallery.classList.remove("is-changing"));
      },
      prefersReducedMotion ? 0 : 140,
    );
  });
}

function bindTabs() {
  const tabs = [...document.querySelectorAll("[data-admission-tab]")];
  const panels = [...document.querySelectorAll("[data-admission-panel]")];
  if (!tabs.length || !panels.length) return;

  const activateTab = (tab, moveFocus = false) => {
    const key = tab.dataset.admissionTab;

    tabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.admissionPanel === key;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });

    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    const key = tab.dataset.admissionTab;
    const panel = panels.find((item) => item.dataset.admissionPanel === key);
    tab.id = `admission-tab-${key}`;
    tab.setAttribute("aria-controls", `admission-panel-${key}`);
    panel.id = `admission-panel-${key}`;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);

    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === index) return;
      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });

  activateTab(tabs.find((tab) => tab.classList.contains("active")) || tabs[0]);
}

function bindScrollExperience() {
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);

  let scrollTicking = false;
  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateScroll);
    },
    { passive: true },
  );
  updateScroll();

  const revealGroups = [
    ".care-copy > *",
    ".trust-strip article",
    ".greeting-detail .eyebrow, .greeting-detail h2, .greeting-detail .text-card",
    ".services .section-inner > h2, .service-card",
    ".admission-content > .badge, .admission-content > h2, .tabs, .tab-panel",
    ".facility-info-card, .gallery-block",
    ".contact-grid > *",
    ".location-grid > *",
    ".philosophy-lines p",
  ];

  const revealItems = revealGroups.flatMap((selector) => [...document.querySelectorAll(selector)]);
  revealItems.forEach((item, index) => {
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${(index % 5) * 55}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const resetBuffer = 96;
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            return;
          }

          const isFullyAbove = entry.boundingClientRect.bottom < -resetBuffer;
          const isFullyBelow = entry.boundingClientRect.top > window.innerHeight + resetBuffer;
          if (isFullyAbove || isFullyBelow) entry.target.classList.remove("is-visible");
        });
      },
      { threshold: 0.08, rootMargin: "96px 0px" },
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    let revealResetTicking = false;
    const resetRevealsOutsideViewport = () => {
      revealItems.forEach((item) => {
        if (!item.classList.contains("is-visible")) return;
        const rect = item.getBoundingClientRect();
        const isFullyAbove = rect.bottom <= -resetBuffer;
        const isFullyBelow = rect.top >= window.innerHeight + resetBuffer;
        if (isFullyAbove || isFullyBelow) item.classList.remove("is-visible");
      });
      revealResetTicking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (revealResetTicking) return;
        revealResetTicking = true;
        requestAnimationFrame(resetRevealsOutsideViewport);
      },
      { passive: true },
    );
  }

  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-menu a[href^="#"]')];
  const sectionMap = new Map(
    navLinks.map((link) => {
      const id = link.getAttribute("href");
      return [id, document.querySelector(id)];
    }),
  );

  const setCurrentSection = (id) => {
    navLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === id;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setCurrentSection(`#${current.target.id}`);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );
    sectionMap.forEach((section) => {
      if (section) sectionObserver.observe(section);
    });
  }

  requestAnimationFrame(() => document.body.classList.add("is-ready"));
}

function bindContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector("[data-contact-status]");
  const defaultButtonText = submitButton?.textContent || "메시지 보내기";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    submitButton.textContent = "전송 중...";
    status.className = "contact-form-status";
    status.textContent = "문의를 안전하게 전송하고 있습니다.";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Form submission failed");

      form.reset();
      status.classList.add("success");
      status.textContent = "문의가 접수되었습니다. 확인 후 연락드리겠습니다.";
    } catch {
      status.classList.add("error");
      status.textContent = "전송하지 못했습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonText;
    }
  });
}

function bindCareTools() {
  const widget = document.querySelector("[data-care-widget]");
  const toggle = document.querySelector("[data-care-toggle]");
  const fontButtons = [...document.querySelectorAll("[data-font-control]")];
  const scales = [0.94, 1, 1.18, 1.36];
  let scaleIndex = Number(localStorage.getItem("silverRunFontScale") || "1");
  let activeControl = localStorage.getItem("silverRunFontControl") || "";

  const sync = () => {
    scaleIndex = Math.max(0, Math.min(scales.length - 1, scaleIndex));
    document.documentElement.style.setProperty("--font-scale", scales[scaleIndex]);
    fontButtons.forEach((button) => {
      const isActive = button.dataset.fontControl === activeControl;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    localStorage.setItem("silverRunFontScale", String(scaleIndex));
    localStorage.setItem("silverRunFontControl", activeControl);
  };

  toggle?.addEventListener("click", () => {
    const isOpen = widget.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "상담 메뉴 닫기" : "상담 메뉴 열기");
  });

  document.addEventListener("click", (event) => {
    if (!widget || widget.contains(event.target)) return;
    widget.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "상담 메뉴 열기");
  });

  fontButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeControl = button.dataset.fontControl;
      scaleIndex += activeControl === "larger" ? 1 : -1;
      sync();
    });
  });

  sync();
}

renderServices();
renderFacilityInfo();
bindGallery({
  filterSelector: "[data-gallery-filters]",
  gallerySelector: "[data-facility-gallery]",
  items: pageData.facilityGallery || [],
});
bindGallery({
  filterSelector: "[data-intro-filters]",
  gallerySelector: "[data-facility-intro]",
  items: pageData.facilityIntro || [],
});
bindHeader();
bindTabs();
bindContactForm();
bindCareTools();
bindScrollExperience();
