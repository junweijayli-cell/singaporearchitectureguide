# Publishing Guide

Use these steps when uploading this package into the `singaporearchitectureguide` repository.

1. Copy the contents of this folder into the root of the GitHub repository.
2. Commit and push the files to the `main` branch.
3. Open the repository on GitHub.
4. Go to `Settings` -> `Pages`.
5. If GitHub asks for a source, choose `GitHub Actions`.
6. Wait for the `Deploy Singapore Architecture Guide` workflow to finish.

After deployment, the site should publish at:

`https://<your-github-username>.github.io/singaporearchitectureguide/`

## Notes

- The site is static and does not require a build step on GitHub.
- Real project images and site plans are already bundled under `assets/`.
- `.nojekyll` is included so GitHub Pages serves the files exactly as-is.
