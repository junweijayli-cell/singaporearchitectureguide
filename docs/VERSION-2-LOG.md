# Version 2 Log

Date: 2026-04-07

## Snapshot

This log records Version 2 of the Singapore Architecture Guide after the major media curation and project dataset upgrade.

## Included In Version 2

- Curated architectural hero and insight images with stronger project-specific photo selection
- Updated hero and closer-reading swaps for key projects including Old Hill Street Police Station, South Beach, Oasia Hotel Downtown, and The Interlace
- Architecture-only image policy applied to project media
- `Office` added as a new category
- `CapitaSpring` by `BIG + Carlo Ratti Associati` added
- `EDEN Singapore Apartments` by `Heatherwick Studio` added
- `Others` fully replaced by `Mix-Use`
- Plan coverage for every listed project
- Published floor plans where available, with footprint-diagram fallback plans for the remaining projects
- Refreshed optimized GitHub upload package

## Main Files

- `data/projects.json`
- `data/media-manifest.json`
- `data/app-data.js`
- `project.js`
- `shared.js`
- `script.js`
- `tools/refresh_curated_media.py`
- `tools/build_site_bundle.py`
- `tools/optimize_site_assets.py`

## Notes

- ArchDaily was prioritized for project photography whenever a project was available there
- Local project media continues to live under `assets/projects/`
- The overview map remains at `assets/map/singapore-overview.png`
- The GitHub-ready archive was rebuilt as `singaporearchitectureguide-github-package.zip`
