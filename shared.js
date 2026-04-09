(function () {
  const guide = window.ARCHITECTURE_GUIDE || {};

  const METRICS = [
    { key: "designExpression", label: "Design expression" },
    { key: "technicalExecution", label: "Technical execution" },
    { key: "userExperience", label: "User experience" },
    { key: "sustainability", label: "Sustainability" },
    { key: "contextAgency", label: "Context agency" }
  ];

  const categoryStyles = guide.categoryStyles || {};

  function averageScore(project) {
    const values = METRICS.map((metric) => Number(project.scores?.[metric.key] || 0));
    return values.reduce((sum, value) => sum + value, 0) / METRICS.length;
  }

  function recommendationLevel(input) {
    const score = typeof input === "number" ? input : averageScore(input);
    if (score >= 4.65) {
      return "Essential visit";
    }
    if (score >= 4.35) {
      return "Highly recommended";
    }
    if (score >= 4.0) {
      return "Worth the stop";
    }
    return "Focused interest";
  }

  function formatScore(value) {
    return Number(value).toFixed(1);
  }

  function slugUrl(projectId) {
    return `project.html?project=${encodeURIComponent(projectId)}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cssImage(path) {
    return `url('${String(path).replace(/'/g, "%27")}')`;
  }

  function getCategoryStyle(category) {
    return categoryStyles[category] || { color: "#4c5668", surface: "#dbe0e8" };
  }

  function getMapPosition(location) {
    const bounds = guide.overviewBounds;
    if (!location || !bounds) {
      return { xPercent: 50, yPercent: 50 };
    }

    const tileScale = 256 * Math.pow(2, bounds.zoom);
    const worldX = ((location.lon + 180) / 360) * tileScale;
    const sinLat = Math.sin((location.lat * Math.PI) / 180);
    const worldY =
      (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * tileScale;

    const originX = bounds.worldLeft ?? bounds.xBase * 256 + (bounds.offsetX || 0);
    const originY = bounds.worldTop ?? bounds.yBase * 256 + (bounds.offsetY || 0);
    const pixelX = worldX - originX;
    const pixelY = worldY - originY;

    return {
      xPercent: Math.max(0, Math.min(100, (pixelX / bounds.width) * 100)),
      yPercent: Math.max(0, Math.min(100, (pixelY / bounds.height) * 100))
    };
  }

  function enrichProject(project) {
    const recommendationScore = averageScore(project);
    return {
      ...project,
      recommendationScore,
      recommendationLevel: recommendationLevel(recommendationScore)
    };
  }

  const projects = (guide.projects || []).map(enrichProject);
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  function getProjects() {
    return projects.slice();
  }

  function getProject(projectId) {
    return projectMap.get(projectId) || null;
  }

  function getCategories() {
    return Object.keys(categoryStyles);
  }

  function getDistricts() {
    return ["All districts"].concat(
      Array.from(new Set(projects.map((project) => project.district))).sort((left, right) =>
        left.localeCompare(right)
      )
    );
  }

  function buildScoreRows(project) {
    return METRICS.map((metric) => {
      const value = Number(project.scores[metric.key] || 0);
      return `
        <div class="score-row">
          <span class="score-row__label">${escapeHtml(metric.label)}</span>
          <span class="score-row__value">${formatScore(value)}</span>
          <div class="score-row__bar" aria-hidden="true">
            <span class="score-row__fill" style="--width:${(value / 5) * 100}%"></span>
          </div>
        </div>
      `;
    }).join("");
  }

  function buildTagRow(tags, count) {
    return tags
      .slice(0, count)
      .map((tag) => `<span>${escapeHtml(tag)}</span>`)
      .join("");
  }

  function countByCategory(list) {
    const counts = new Map();
    list.forEach((project) => {
      counts.set(project.category, (counts.get(project.category) || 0) + 1);
    });
    return counts;
  }

  function buildSourceLinks(project) {
    const sources = project.assets?.sources;
    if (!sources) {
      return "";
    }

    const links = [];
    if (typeof sources.hero === "string" && sources.hero.startsWith("http")) {
      links.push(`<a href="${escapeHtml(sources.hero)}" target="_blank" rel="noreferrer">Hero image source</a>`);
    }
    if (Array.isArray(sources.gallery)) {
      sources.gallery.forEach((source, index) => {
        if (typeof source === "string" && source.startsWith("http")) {
          links.push(
            `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">Insight image ${index + 1} source</a>`
          );
        }
      });
    }
    if (typeof sources.plan === "string" && sources.plan.startsWith("http")) {
      links.push(`<a href="${escapeHtml(sources.plan)}" target="_blank" rel="noreferrer">Plan source</a>`);
    }
    return links.length ? `<div class="source-links">${links.join("")}</div>` : "";
  }

  function relatedProjects(project, limit) {
    return projects
      .filter((candidate) => candidate.id !== project.id)
      .sort((left, right) => {
        const sameCategory = Number(right.category === project.category) - Number(left.category === project.category);
        if (sameCategory !== 0) {
          return sameCategory;
        }
        return right.recommendationScore - left.recommendationScore;
      })
      .slice(0, limit);
  }

  window.GuideUtils = {
    METRICS,
    averageScore,
    recommendationLevel,
    formatScore,
    slugUrl,
    escapeHtml,
    cssImage,
    getCategoryStyle,
    getMapPosition,
    getProjects,
    getProject,
    getCategories,
    getDistricts,
    buildScoreRows,
    buildTagRow,
    countByCategory,
    buildSourceLinks,
    relatedProjects,
    guide
  };
})();
