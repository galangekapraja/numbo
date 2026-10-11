# Publishing Numbo on GitHub

No API key, token or secret is needed. GitHub Pages is free for public repositories.

## 1. Put the code on GitHub

1. Create an empty repository on GitHub (for example `numbo`). Do not add a README, license or .gitignore there; they already exist here.
2. In the project folder:
   ```bash
   git init -b main
   git add .
   git commit -m "Numbo: math adventures for grades 1-6"
   git remote add origin https://github.com/galangekapraja/numbo.git
   git push -u origin main
   ```
   If GitHub asks you to sign in, use the GitHub CLI (`gh auth login`), a personal access token as the password,
   or an SSH remote (`git@github.com:galangekapraja/numbo.git`).
3. The repository is about 9 MB (mostly the recorded voice), well below GitHub's limits.

## 2. Turn on GitHub Pages

1. On GitHub open the repository: **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Push any commit to `main` (or open **Actions → Deploy to GitHub Pages → Run workflow**).
4. After about a minute the site is live at `https://galangekapraja.github.io/numbo/`.

The workflow runs `npm run build` and publishes `dist/index.html`. The page uses only relative paths, so the sub-folder address works.

## 3. Checks on every push

`.github/workflows/ci.yml` builds the page and runs `npm test` plus the Chromium checks (audio, responsive layout, accessibility).
A red cross on a commit means one of them failed; open the run to see which.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Pages shows 404 | Check Settings → Pages → Source is **GitHub Actions**, and that the workflow run finished green |
| Pages workflow fails on "Get Pages site" | Enable Pages first (step 2.2), then re-run the workflow |
| No sound on the live site | Tap the page once, then **Settings → Hear it** and read the line it prints |
| Page loads slowly | The page embeds all recorded voice (about 11 MB). It is cached after the first visit |
| Want a private repo | Pages for private repos needs a paid GitHub plan; you can also host `dist/index.html` on any static host |
