const assets = "./public/assets/";

const services = [
  {
    image: "gallery-activity-CB4uWo5p.webp",
    title: "스마트 운동재활 서비스",
    description: "슬링, 워킹레일, 순환운동을 활용한 안전한 신체 기능 회복 프로그램",
  },
  {
    image:
      "asian-young-caregiver-caring-her-elderly-patient-senior-daycare-handicap-patient-wheelchair-hospital-talking-friendly-nurse-looking-cheerful-nurse-wheeling-senior-patient_1760420183851.jpg",
    title: "의료·간호 서비스",
    description: "혈압, 당뇨, 투약 관리 등 어르신 건강 상태에 맞춘 세심한 관리",
  },
  {
    image: "ChatGPT-Image-2025년-10월-16일-오후-05_51_02_1760604714476.png",
    title: "인지·정서 지원 서비스",
    description: "치매 예방 활동과 정서적 안정을 돕는 다양한 프로그램",
  },
  {
    image:
      "old-senior-asian-friends-retired-people-hapiness-positive-laugh-smile-conversation-together-living-room-nursing-home-seniors-participating-group-activities-adult-daycare-center_1760605879161.jpg",
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

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    header.classList.toggle("menu-open", isOpen);
    button.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menu.classList.remove("open");
      header.classList.remove("menu-open");
    }
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

  mount.innerHTML = visibleItems
    .map(
      (item) => `
        <figure>
          <img src="${assets}${encodeURI(item.image)}" alt="${item.name || item.title} 시설 이미지" loading="lazy" />
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

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderFilterButtons(filters, items, activeCategory);
    renderGallery(gallery, items, activeCategory);
  });
}

function bindTabs() {
  const tabs = [...document.querySelectorAll("[data-admission-tab]")];
  const panels = [...document.querySelectorAll("[data-admission-panel]")];

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.admissionTab;
      tabs.forEach((item) => item.classList.toggle("active", item === tab));
      panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.admissionPanel === key));
    });
  });
}

function bindContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.reset();
    alert("문의가 접수되었습니다. 실제 전송 연동은 다음 개발 단계에서 연결하면 됩니다.");
  });
}

function bindCareTools() {
  const fontButtons = [...document.querySelectorAll("[data-font-control]")];
  const contrastButton = document.querySelector("[data-contrast-control]");
  const scales = [0.94, 1, 1.12, 1.24];
  let scaleIndex = Number(localStorage.getItem("silverRunFontScale") || "1");
  let highContrast = localStorage.getItem("silverRunHighContrast") === "true";

  const sync = () => {
    scaleIndex = Math.max(0, Math.min(scales.length - 1, scaleIndex));
    document.documentElement.style.setProperty("--font-scale", scales[scaleIndex]);
    document.body.classList.toggle("high-contrast", highContrast);
    fontButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        (button.dataset.fontControl === "smaller" && scaleIndex === 0) ||
          (button.dataset.fontControl === "larger" && scaleIndex >= 2),
      );
    });
    contrastButton?.classList.toggle("active", highContrast);
    localStorage.setItem("silverRunFontScale", String(scaleIndex));
    localStorage.setItem("silverRunHighContrast", String(highContrast));
  };

  fontButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scaleIndex += button.dataset.fontControl === "larger" ? 1 : -1;
      sync();
    });
  });

  contrastButton?.addEventListener("click", () => {
    highContrast = !highContrast;
    sync();
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
