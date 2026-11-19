/* =========================================================
   Interaksi situs portofolio (JavaScript vanilla, tanpa library)
   ========================================================= */
(function () {
  "use strict";

  // Tandai bahwa JS aktif, supaya animasi reveal hanya berlaku bila JS jalan
  document.documentElement.classList.add("js");

  /* ---------- 1. Menu hamburger (HP & tablet) ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    toggle.querySelector("i").className = open ? "bi bi-x-lg" : "bi bi-list";
  }

  if (toggle && menu) {
    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    // Tutup menu setelah memilih tautan
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    // Tutup menu dengan tombol Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    // Reset saat layar diperlebar ke ukuran desktop
    window.matchMedia("(min-width: 900px)").addEventListener("change", () => setMenu(false));
  }

  /* ---------- 2. Tandai menu aktif sesuai section yang terlihat ---------- */
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = [...navLinks]
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => {
            const active = a.getAttribute("href") === "#" + entry.target.id;
            a.classList.toggle("is-active", active);
            if (active) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------- 3. Animasi muncul saat scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // cukup sekali
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- 4. Lightbox gambar proyek ---------- */
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbOpen = document.getElementById("lb-open");
  const lbZoom = document.getElementById("lb-zoom");
  const lbClose = document.getElementById("lb-close");
  let lastTrigger = null;

  function setZoom(on) {
    lightbox.classList.toggle("is-zoomed", on);
    lbZoom.setAttribute("aria-pressed", String(on));
    lbZoom.innerHTML = on
      ? '<i class="bi bi-zoom-out" aria-hidden="true"></i> Perkecil'
      : '<i class="bi bi-zoom-in" aria-hidden="true"></i> Perbesar';
  }

  if (lightbox && typeof lightbox.showModal === "function") {
    document.querySelectorAll("[data-lightbox]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        lastTrigger = link;
        const img = link.querySelector("img");
        lbImg.src = link.getAttribute("href");
        lbImg.alt = img ? img.alt : "";
        lbOpen.href = link.getAttribute("href");
        setZoom(false);
        lightbox.showModal();
      });
    });

    lbZoom.addEventListener("click", () => setZoom(!lightbox.classList.contains("is-zoomed")));
    lbImg.addEventListener("click", () => setZoom(!lightbox.classList.contains("is-zoomed")));
    lbClose.addEventListener("click", () => lightbox.close());
    // Klik di luar gambar (area latar dialog) untuk menutup
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.close();
    });
    // Kembalikan fokus ke gambar yang diklik setelah ditutup
    lightbox.addEventListener("close", () => {
      lbImg.src = "";
      if (lastTrigger) lastTrigger.focus();
    });
  }
  // Jika browser tidak mendukung <dialog>, tautan tetap membuka gambar di halaman baru.

  /* ---------- 5. Form kontak: buka draf email (tanpa server) ---------- */
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  const EMAIL_TUJUAN = "ignatiusfelixc@gmail.com"; // TODO: ubah jika email berganti

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const nama = (data.get("nama") || "").trim();
      const email = (data.get("email") || "").trim();
      const subjek = (data.get("subjek") || "").trim();
      const pesan = (data.get("pesan") || "").trim();

      // Validasi sederhana
      const kosong = [...form.querySelectorAll("[required]")].find((f) => !f.value.trim());
      if (kosong) {
        note.textContent = "Mohon lengkapi semua kolom.";
        kosong.focus();
        return;
      }
      if (!form.querySelector("#f-email").checkValidity()) {
        note.textContent = "Format email belum benar.";
        form.querySelector("#f-email").focus();
        return;
      }

      const body = `${pesan}\n\n---\nDari: ${nama} (${email})`;
      const url = `mailto:${EMAIL_TUJUAN}?subject=${encodeURIComponent(subjek)}&body=${encodeURIComponent(body)}`;
      note.textContent = "Membuka aplikasi email Anda...";
      window.location.href = url;
    });
  }

  /* ---------- 6. Tahun otomatis di footer ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
