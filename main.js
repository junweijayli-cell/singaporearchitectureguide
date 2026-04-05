(function () {
  const {
    guide,
    getProjects,
    getCategories,
    getDistricts,
    getCategoryStyle,
    getMapPosition,
    buildScoreRows,
    buildTagRow,
    escapeHtml,
    cssImage,
    slugUrl,
    countByCategory
  } = window.GuideUtils;

  const elements = {
    heroBackdrop: document.getElementById("heroBackdrop"),
    heroSubtitle: document.getElementById("heroSubtitle"),
    heroStats: document.getElementById("heroStats"),
    heroVideoFrame: document.getElementById("heroVideoFrame"),
    heroVideoTitle: document.getElementById("heroVideoTitle"),
    heroVideoDescription: document.getElementById("heroVideoDescription"),
    heroVideoSource: document.getElementById("heroVideoSource"),
    heroVideoList: document.getElementById("heroVideoList"),
    overviewMap: document.getElementById("overviewMap"),
    mapPins: document.getElementById("mapPins"),
    mapLegend: document.getElementById("mapLegend"),
    mapSummary: document.getElementById("mapSummary"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect"),
    districtSelect: document.getElementById("districtSelect"),
    categoryFilters: document.getElementById("categoryFilters"),
    projectGrid: document.getElementById("projectGrid"),
    resultsCount: document.getElementById("resultsCount"),
    resultsSummary: document.getElementById("resultsSummary"),
    attributionText: document.getElementById("attributionText")
  };

  const allProjects = getProjects();
  const state = {
    search: "",
    category: "All",
    district: "All districts",
    sort: "recommendation",
    activeVideoId: guide.videoHighlights?.[0]?.projectId || null
  };

  function init() {
    elements.heroSubtitle.textContent = guide.subtitle || elements.heroSubtitle.textContent;
    if (elements.overviewMap && guide.overviewMap) {
      elements.overviewMap.src = guide.overviewMap;
    }

    populateDistricts();
    renderCategoryFilters();
    renderHeroStats();
    renderVideos();
    render();

    elements.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value.trim().toLowerCase();
      render();
    });

    elements.sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      render();
    });

    elements.districtSelect.addEventListener("change", (event) => {
      state.district = event.target.value;
      render();
    });

    if (elements.attributionText) {
      elements.attributionText.textContent =
        "Project photographs are stored locally for this guide. Map base by OpenStreetMap contributors.";
    }
  }

  function populateDistricts() {
    elements.districtSelect.innerHTML = getDistricts()
      .map((district) => `<option value="${escapeHtml(district)}">${escapeHtml(district)}</option>`)
      .join("");
  }

  function renderCategoryFilters() {
    const chips = [`<button type="button" class="filter-chip is-active" data-category="All">All</button>`];
    getCategories().forEach((category) => {
      chips.push(
        `<button type="button" class="filter-chip" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
      );
    });
    elements.categoryFilters.innerHTML = chips.join("");
    elements.categoryFilters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) {
        return;
      }
      state.category = button.dataset.category;
      Array.from(elements.categoryFilters.querySelectorAll(".filter-chip")).forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset.category === state.category);
      });
      render();
    });
  }

  function renderHeroStats() {
    const essential = allProjects.filter((project) => project.recommendationScore >= 4.65).length;
    const stats = [
      { value: allProjects.length, label: "Local projects" },
      { value: getCategories().length, label: "Categories" },
      { value: essential, label: "Essential visits" },
      { value: getDistricts().length - 1, label: "Districts" }
    ];

    elements.heroStats.innerHTML = stats
      .map(
        (stat) => `
          <div class="hero-stat">
            <strong>${escapeHtml(String(stat.value))}</strong>
            <span>${escapeHtml(stat.label)}</span>
          </div>
        `
      )
      .join("");
  }

  function renderVideos() {
    const videos = guide.videoHighlights || [];
    const activeVideo = videos.find((item) => item.projectId === state.activeVideoId) || videos[0];
    if (!activeVideo) {
      return;
    }

    state.activeVideoId = activeVideo.projectId;
    elements.heroBackdrop.style.setProperty("--hero-image", cssImage(activeVideo.poster));
    if (elements.heroVideoFrame.src !== activeVideo.embedUrl) {
      elements.heroVideoFrame.src = activeVideo.embedUrl;
    }
    elements.heroVideoTitle.textContent = activeVideo.title;
    elements.heroVideoDescription.textContent = activeVideo.description;
    elements.heroVideoSource.textContent = `Source: ${activeVideo.sourceLabel}`;

    elements.heroVideoList.innerHTML = videos
      .map(
        (item) => `
          <button
            type="button"
            class="video-option ${item.projectId === activeVideo.projectId ? "is-active" : ""}"
            data-video-id="${escapeHtml(item.projectId)}"
            style="--thumb-image:${cssImage(item.poster)}"
          >
            <span class="video-option__thumb" aria-hidden="true"></span>
            <span class="video-option__copy">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.sourceLabel)}</span>
            </span>
          </button>
        `
      )
      .join("");

    Array.from(elements.heroVideoList.querySelectorAll("[data-video-id]")).forEach((button) => {
      button.addEventListener("click", () => {
        state.activeVideoId = button.dataset.videoId;
        renderVideos();
      });
    });
  }

  function filterProjects() {
    return allProjects
      .filter((project) => {
        const matchesCategory = state.category === "All" || project.category === state.category;
        const matchesDistrict = state.district === "All districts" || project.district === state.district;
        if (!matchesCategory || !matchesDistrict) {
          return false;
        }

        if (!state.search) {
          return true;
        }

        const haystack = [
          project.name,
          project.category,
          project.district,
          project.architect,
          project.blurb,
          project.whyGo,
          ...(project.tags || [])
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(state.search);
      })
      .sort((left, right) => {
        if (state.sort === "name") {
          return left.name.localeCompare(right.name);
        }
        if (state.sort === "year") {
          return right.year - left.year;
        }
        if (state.sort === "recommendation") {
          return right.recommendationScore - left.recommendationScore;
        }
        return Number(right.scores[state.sort] || 0) - Number(left.scores[state.sort] || 0);
      });
  }

  function renderMap(projects) {
    elements.mapPins.innerHTML = projects
      .map((project) => {
        const style = getCategoryStyle(project.category);
        const position = getMapPosition(project.location);
        return `
          <a
            class="map-pin"
            href="${slugUrl(project.id)}"
            style="--x:${position.xPercent}%; --y:${position.yPercent}%; --pin-color:${style.color};"
            aria-label="${escapeHtml(project.name)}"
          >
            <span class="map-pin__label">${escapeHtml(project.name)}</span>
            <span class="map-pin__dot"></span>
          </a>
        `;
      })
      .join("");

    const counts = countByCategory(projects);
    elements.mapLegend.innerHTML = getCategories()
      .map((category) => {
        const style = getCategoryStyle(category);
        return `
          <div class="legend-row">
            <strong><span class="legend-swatch" style="--swatch:${style.color}"></span>${escapeHtml(category)}</strong>
            <span>${counts.get(category) || 0}</span>
          </div>
        `;
      })
      .join("");

    const districtCounts = new Map();
    projects.forEach((project) => {
      districtCounts.set(project.district, (districtCounts.get(project.district) || 0) + 1);
    });

    const topDistricts = Array.from(districtCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4);

    elements.mapSummary.innerHTML = [
      `<p>${projects.length} projects are currently pinned across ${counts.size || getCategories().length} visible categories.</p>`,
      ...topDistricts.map(
        ([district, count]) => `
          <div class="summary-row">
            <strong>${escapeHtml(district)}</strong>
            <span>${count} project${count === 1 ? "" : "s"}</span>
          </div>
        `
      )
    ].join("");
  }

  function renderProjects(projects) {
    elements.resultsCount.textContent = String(projects.length);

    const filters = [];
    if (state.category !== "All") {
      filters.push(state.category);
    }
    if (state.district !== "All districts") {
      filters.push(state.district);
    }
    if (state.search) {
      filters.push(`search: ${state.search}`);
    }

    elements.resultsSummary.textContent = filters.length
      ? `Showing ${projects.length} projects for ${filters.join(" · ")}. Hover any card to reveal the ratings.`
      : `Showing all ${projects.length} projects. Hover any card to reveal the ratings.`;

    if (!projects.length) {
      elements.projectGrid.innerHTML = `
        <div class="empty-state">
          <p class="eyebrow">No Match</p>
          <h3>Try widening the search or changing the category filter.</h3>
        </div>
      `;
      return;
    }

    elements.projectGrid.innerHTML = projects
      .map((project) => {
        const categoryStyle = getCategoryStyle(project.category);
        return `
          <a
            class="project-card"
            href="${slugUrl(project.id)}"
            style="--card-image:${cssImage(project.assets.hero)}"
          >
            <div class="project-card__always">
              <div class="project-card__topline">
                <span class="category-pill" style="background:${categoryStyle.color}22; border-color:${categoryStyle.color}40;">${escapeHtml(project.category)}</span>
                <span class="project-level">${escapeHtml(project.access)}</span>
              </div>
              <div>
                <p class="project-card__meta">${escapeHtml(project.district)} · ${escapeHtml(String(project.year))}</p>
                <h3>${escapeHtml(project.name)}</h3>
                <p class="project-card__blurb">${escapeHtml(project.blurb)}</p>
                <div class="tag-row">${buildTagRow(project.tags || [], 3)}</div>
              </div>
            </div>

            <div class="project-card__hover">
              <span class="category-pill">${escapeHtml(project.recommendationLevel)}</span>
              <div class="tag-row" style="margin-top:0.85rem;">${buildTagRow(project.tags || [], 3)}</div>
              <div style="margin-top:0.95rem;">
                ${buildScoreRows(project)}
              </div>
            </div>
          </a>
        `;
      })
      .join("");
  }

  function render() {
    const filteredProjects = filterProjects();
    renderMap(filteredProjects);
    renderProjects(filteredProjects);
  }

  init();
})();
