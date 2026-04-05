(function () {
  const {
    guide,
    getProject,
    getCategoryStyle,
    getMapPosition,
    buildScoreRows,
    buildSourceLinks,
    buildTagRow,
    escapeHtml,
    cssImage,
    relatedProjects,
    slugUrl
  } = window.GuideUtils;

  const root = document.getElementById("projectRoot");
  const attribution = document.getElementById("detailAttributionText");
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("project");
  const project = projectId ? getProject(projectId) : null;

  if (attribution) {
    attribution.textContent =
      "Project photographs are stored locally for this guide. Map base by OpenStreetMap contributors.";
  }

  if (!project) {
    root.innerHTML = `
      <section class="detail-loading">
        <p class="eyebrow">Missing Project</p>
        <h1>This project page could not be found.</h1>
        <p class="detail-copy">Return to the guide and choose a project card from the main browse page.</p>
        <a class="button button--primary" href="index.html#projects">Back To Guide</a>
      </section>
    `;
    return;
  }

  const categoryStyle = getCategoryStyle(project.category);
  const position = getMapPosition(project.location);
  const projectVideo = (guide.videoHighlights || []).find((item) => item.projectId === project.id);
  const galleryImage = project.assets.gallery?.[0] || project.assets.hero;
  const sourcesMarkup = buildSourceLinks(project);
  const related = relatedProjects(project, 3);

  document.title = `${project.name} | Explore Singaporean Architecture`;

  root.innerHTML = `
    <section class="project-hero" style="--detail-image:${cssImage(project.assets.hero)};">
      <div class="project-hero__content">
        <a class="back-link" href="index.html#projects">Back to project browse</a>
        <p class="eyebrow eyebrow--light">${escapeHtml(project.category)} · ${escapeHtml(project.district)}</p>
        <h1>${escapeHtml(project.name)}</h1>
        <p class="project-hero__lede">${escapeHtml(project.blurb)}</p>
        <div class="project-hero__meta">
          <span>${escapeHtml(project.architect)}</span>
          <span>${escapeHtml(String(project.year))}</span>
          <span>${escapeHtml(project.access)}</span>
          <span>${escapeHtml(project.recommendationLevel)}</span>
        </div>
      </div>
    </section>

    <section class="detail-layout">
      <div class="detail-main">
        <article class="detail-card">
          <p class="eyebrow">Why Go</p>
          <h2>Why this project matters on the ground.</h2>
          <p class="detail-copy">${escapeHtml(project.whyGo)}</p>
        </article>

        <section class="detail-gallery">
          <figure class="detail-figure detail-figure--wide">
            <img src="${escapeHtml(project.assets.hero)}" alt="${escapeHtml(project.name)} hero view">
            <figcaption>
              <span>Hero View</span>
              <strong>${escapeHtml(project.name)}</strong>
              <p>Main project image used throughout the guide.</p>
            </figcaption>
          </figure>

          <figure class="detail-figure">
            <img src="${escapeHtml(galleryImage)}" alt="${escapeHtml(project.name)} insight image">
            <figcaption>
              <span>Spatial Insight</span>
              <strong>Closer reading</strong>
              <p>An additional image for reading atmosphere, facade, or interior character.</p>
            </figcaption>
          </figure>

          <figure class="detail-figure detail-figure--plan">
            <img src="${escapeHtml(project.assets.plan)}" alt="${escapeHtml(project.name)} site plan">
            <figcaption>
              <span>Key Plan</span>
              <strong>Urban footprint</strong>
              <p>A local site-plan image showing the building footprint and its immediate urban context.</p>
            </figcaption>
          </figure>
        </section>

        <article class="detail-card">
          <p class="eyebrow">What To Look For</p>
          <h2>Three on-site observations worth paying attention to.</h2>
          <ul class="detail-list">
            ${(project.lookFor || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </article>

        ${
          projectVideo
            ? `
              <article class="detail-card detail-video">
                <p class="eyebrow">Project Film</p>
                <h2>${escapeHtml(projectVideo.title)} on video</h2>
                <p class="detail-copy">${escapeHtml(projectVideo.description)}</p>
                <iframe
                  title="${escapeHtml(projectVideo.title)} video"
                  src="${escapeHtml(projectVideo.embedUrl)}"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </article>
            `
            : ""
        }

        <article class="detail-card">
          <p class="eyebrow">Related Projects</p>
          <h2>Keep reading through adjacent categories and districts.</h2>
          <div class="related-grid">
            ${related
              .map(
                (item) => `
                  <a class="related-card" href="${slugUrl(item.id)}" style="--card-image:${cssImage(item.assets.hero)};">
                    <div class="related-card__meta">
                      <p class="project-card__meta">${escapeHtml(item.category)} · ${escapeHtml(item.district)}</p>
                      <h3>${escapeHtml(item.name)}</h3>
                    </div>
                  </a>
                `
              )
              .join("")}
          </div>
        </article>
      </div>

      <aside class="detail-panel">
        <article class="detail-card">
          <p class="eyebrow">Recommendation Profile</p>
          <h2>Five-part rating breakdown.</h2>
          <div style="margin-top:0.9rem;">
            ${buildScoreRows(project)}
          </div>
        </article>

        <article class="detail-card">
          <p class="eyebrow">Project Facts</p>
          <h2>Key visit information.</h2>
          <dl class="metadata-list" style="margin-top:0.9rem;">
            <dt>Architect</dt>
            <dd>${escapeHtml(project.architect)}</dd>
            <dt>Year</dt>
            <dd>${escapeHtml(String(project.year))}</dd>
            <dt>Category</dt>
            <dd>${escapeHtml(project.category)}</dd>
            <dt>District</dt>
            <dd>${escapeHtml(project.district)}</dd>
            <dt>Access</dt>
            <dd>${escapeHtml(project.access)}</dd>
            <dt>Tags</dt>
            <dd><div class="tag-row">${buildTagRow(project.tags || [], 4)}</div></dd>
          </dl>
        </article>

        <article class="detail-card">
          <p class="eyebrow">Location</p>
          <h2>Where it sits in the island-wide guide.</h2>
          <div class="mini-map">
            <img src="${escapeHtml(guide.overviewMap)}" alt="Map locating ${escapeHtml(project.name)}">
            <span class="mini-map__pin" style="--x:${position.xPercent}%; --y:${position.yPercent}%; --pin-color:${categoryStyle.color};"></span>
          </div>
          <p class="detail-copy">${escapeHtml(project.district)} remains one of the clearest ways to understand how this project relates to the larger Singaporean urban field.</p>
        </article>

        ${
          sourcesMarkup
            ? `
              <article class="detail-card">
                <p class="eyebrow">Media Sources</p>
                <h2>Reference links</h2>
                ${sourcesMarkup}
              </article>
            `
            : ""
        }
      </aside>
    </section>
  `;
})();
