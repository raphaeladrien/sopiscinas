(() => {
  "use strict";

  // Atualize os dados da empresa aqui; os links, contatos e dados estruturados usam esta configuração.
  const CONFIG = {
    name: "Só Piscinas Equipamentos para Piscinas Ltda",
    whatsappNumber: "5563981224740",
    whatsappMessage:
      "Olá! Vim pelo site da Só Piscinas e gostaria de um orçamento.",
    instagramUrl: "https://www.instagram.com/sopiscinas.araguaina/",
    email: "contato@sopiscinas.com.br",
    address: {
      street: "Av. Tibúrcio José Dantas - Sector Urbanístico",
      postalCode: "77818-773",
      city: "Araguaína",
      region: "TO",
      country: "BR",
    },
    openingHoursDisplay: "Seg a sex 8h–18h · Sáb 8h–13h",
    openingHours: ["Mo-Fr 08:00-18:00", "Sa 08:00-13:00"],
    themeStorageKey: "tema",
    themes: ["azul", "vermelho", "neutro", "agua", "areia"],
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  const selectors = {
    whatsappLinks: "[data-whatsapp]",
    productLinks: "[data-item]",
    instagramLinks: "[data-instagram]",
    instagramHandle: "[data-instagram-handle]",
    contactPhone: "[data-contact-phone]",
    contactEmailLinks: "[data-contact-email-link]",
    contactEmail: "[data-contact-email]",
    contactAddress: "[data-contact-address]",
    contactHours: "[data-contact-hours]",
    contactCity: "[data-contact-city]",
    filterButtons: "[data-filter]",
    viewButtons: "[data-view]",
    themeButtons: "[data-set]",
  };

  function createWhatsAppUrl(message) {
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function formatPhoneNumber() {
    const match = CONFIG.whatsappNumber.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    if (!match) {
      throw new Error("O telefone do WhatsApp deve conter país, DDD e número.");
    }

    return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
  }

  function formatAddress() {
    const { street, city, region } = CONFIG.address;
    return `${street}, ${city} - ${region}`;
  }

  function initializeStructuredData(phone) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: CONFIG.name,
      sameAs: [CONFIG.instagramUrl],
      telephone: phone,
      email: CONFIG.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: CONFIG.address.street,
        postalCode: CONFIG.address.postalCode,
        addressLocality: CONFIG.address.city,
        addressRegion: CONFIG.address.region,
        addressCountry: CONFIG.address.country,
      },
      openingHours: CONFIG.openingHours,
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(structuredData);
    document.head.append(script);
  }

  function initializeContactLinks() {
    const phone = formatPhoneNumber();

    $$(selectors.whatsappLinks).forEach((link) => {
      link.href = createWhatsAppUrl(CONFIG.whatsappMessage);
      link.target = "_blank";
      link.rel = "noopener";
    });

    $$(selectors.productLinks).forEach((link) => {
      const message = `Olá! Tenho interesse em: ${link.dataset.item}. Pode me passar o valor?`;
      link.href = createWhatsAppUrl(message);
      link.target = "_blank";
      link.rel = "noopener";
    });

    $$(selectors.instagramLinks).forEach((link) => {
      link.href = CONFIG.instagramUrl;
    });

    const instagramUsername = new URL(CONFIG.instagramUrl).pathname
      .split("/")
      .filter(Boolean)[0];
    $$(selectors.instagramHandle).forEach((element) => {
      element.textContent = `@${instagramUsername}`;
    });

    $$(selectors.contactPhone).forEach((element) => {
      element.textContent = phone;
    });

    $$(selectors.contactEmailLinks).forEach((link) => {
      link.href = `mailto:${CONFIG.email}`;
    });

    $$(selectors.contactEmail).forEach((element) => {
      element.textContent = CONFIG.email;
    });

    $$(selectors.contactAddress).forEach((element) => {
      element.textContent = formatAddress();
    });

    $$(selectors.contactHours).forEach((element) => {
      element.textContent = CONFIG.openingHoursDisplay;
    });

    $$(selectors.contactCity).forEach((element) => {
      element.textContent = CONFIG.address.city;
    });

    initializeStructuredData(phone);
    $("#ano").textContent = new Date().getFullYear();

    if (/Mac|iPhone|iPad/.test(navigator.platform)) {
      $("#kbd").textContent = "⌘ K";
    }
  }

  function initializeProductControls() {
    const products = $("#products");

    $$(selectors.filterButtons).forEach((button) => {
      button.addEventListener("click", () => {
        $$(selectors.filterButtons).forEach((filter) => {
          filter.setAttribute("aria-pressed", String(filter === button));
        });

        $$(".item", products).forEach((item) => {
          item.hidden =
            button.dataset.filter !== "todos" &&
            item.dataset.cat !== button.dataset.filter;
        });
      });
    });

    $$(selectors.viewButtons).forEach((button) => {
      button.addEventListener("click", () => {
        $$(selectors.viewButtons).forEach((view) => {
          view.setAttribute("aria-pressed", String(view === button));
        });
        products.classList.toggle("list", button.dataset.view === "list");
      });
    });
  }

  function initializeThemes() {
    const themeButtons = $$(selectors.themeButtons);

    function setTheme(theme, persist = true) {
      if (!CONFIG.themes.includes(theme)) return;

      document.documentElement.dataset.theme = theme;
      themeButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.set === theme),
        );
      });

      if (persist) {
        try {
          localStorage.setItem(CONFIG.themeStorageKey, theme);
        } catch (error) {
          console.warn("Não foi possível salvar o tema escolhido.", error);
        }
      }
    }

    try {
      const savedTheme = localStorage.getItem(CONFIG.themeStorageKey);
      if (CONFIG.themes.includes(savedTheme)) setTheme(savedTheme, false);
    } catch (error) {
      console.warn("Não foi possível recuperar o tema salvo.", error);
    }

    themeButtons.forEach((button) => {
      button.addEventListener("click", () => setTheme(button.dataset.set));
    });
  }

  function initializeCommandMenu() {
    const dialog = $("#menu");
    const search = $("#q");
    const actionsList = $("#actions");
    const calculator = $("#calc");
    const listView = $("#list-view");
    let selectedIndex = 0;
    let visibleActions = [];

    const actions = [
      { label: "Calcular volume da piscina", run: showCalculator },
      { label: "Ver produtos", href: "#produtos" },
      { label: "Ver serviços", href: "#servicos" },
      { label: "Ver marcas", href: "#marcas" },
      { label: "Contato", href: "#contato" },
      {
        label: "Chamar no WhatsApp",
        url: () => createWhatsAppUrl(CONFIG.whatsappMessage),
      },
      { label: "Abrir Instagram", url: () => CONFIG.instagramUrl },
    ];

    function updateSelection() {
      $$('button[role="option"]', actionsList).forEach((button, index) => {
        button.setAttribute("aria-selected", String(index === selectedIndex));
      });
    }

    function renderActions() {
      const query = search.value.trim().toLocaleLowerCase("pt-BR");
      visibleActions = actions.filter((action) =>
        action.label.toLocaleLowerCase("pt-BR").includes(query),
      );
      selectedIndex = Math.min(selectedIndex, visibleActions.length - 1);
      actionsList.replaceChildren();

      visibleActions.forEach((action, index) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = action.label;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(index === selectedIndex));
        button.addEventListener("click", () => runAction(action));
        button.addEventListener("mouseenter", () => {
          selectedIndex = index;
          updateSelection();
        });
        item.append(button);
        actionsList.append(item);
      });
    }

    function runAction(action) {
      if (action.run) {
        action.run();
        return;
      }

      dialog.close();
      if (action.href) {
        location.hash = action.href;
      } else if (action.url) {
        window.open(action.url(), "_blank", "noopener");
      }
    }

    function openMenu() {
      listView.hidden = false;
      calculator.hidden = true;
      search.value = "";
      selectedIndex = 0;
      renderActions();
      if (!dialog.open) dialog.showModal();
      search.focus();
    }

    function showCalculator() {
      listView.hidden = true;
      calculator.hidden = false;
      if (!dialog.open) dialog.showModal();
      updateCalculator();
      $("#c").focus();
    }

    search.addEventListener("input", () => {
      selectedIndex = 0;
      renderActions();
    });

    search.addEventListener("keydown", (event) => {
      if (visibleActions.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % visibleActions.length;
        updateSelection();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        selectedIndex =
          (selectedIndex - 1 + visibleActions.length) % visibleActions.length;
        updateSelection();
      } else if (event.key === "Enter" && visibleActions[selectedIndex]) {
        event.preventDefault();
        runAction(visibleActions[selectedIndex]);
      }
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.open) {
          dialog.close();
        } else {
          openMenu();
        }
      }
    });

    $("#open-menu").addEventListener("click", openMenu);
    $("#open-calc").addEventListener("click", showCalculator);
    $("#back").addEventListener("click", openMenu);
  }

  function initializeCalculator() {
    $$("#calc input").forEach((input) => {
      input.addEventListener("input", updateCalculator);
    });
    updateCalculator();
  }

  // Volume is comprimento x largura x profundidade; vazão considera recirculação em 6 h.
  function updateCalculator() {
    const dimensions = ["c", "l", "p"].map((id) =>
      Number.parseFloat($(`#${id}`).value),
    );
    const output = $("#out");
    const whatsappLink = $("#calc-wa");

    if (dimensions.some((value) => !Number.isFinite(value) || value <= 0)) {
      output.textContent =
        "Informe medidas maiores que zero para calcular o volume.";
      whatsappLink.removeAttribute("href");
      whatsappLink.setAttribute("aria-disabled", "true");
      return;
    }

    whatsappLink.removeAttribute("aria-disabled");
    const [length, width, depth] = dimensions;
    const volume = length * width * depth;
    const liters = Math.round(volume * 1000);
    const flow = volume / 6;
    const format = (value, digits) =>
      value.toLocaleString("pt-BR", { maximumFractionDigits: digits });
    const strong = document.createElement("strong");
    const details = document.createElement("small");

    strong.textContent = `${format(liters, 0)} litros (${format(volume, 1)} m³)`;
    details.textContent =
      `Vazão aproximada para recircular a água em 6 horas: ${format(flow, 1)} m³/h. ` +
      "Confirme o equipamento ideal com nossa equipe.";
    output.replaceChildren(strong, details);

    const message =
      `Olá! Minha piscina tem ${format(length, 1)} x ${format(width, 1)} m, ` +
      `profundidade média de ${format(depth, 1)} m (cerca de ${format(liters, 0)} litros). ` +
      "Qual bomba e filtro vocês indicam?";
    whatsappLink.href = createWhatsAppUrl(message);
  }

  initializeContactLinks();
  initializeProductControls();
  initializeThemes();
  initializeCalculator();
  initializeCommandMenu();
})();
