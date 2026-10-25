# Repository Guidelines

## Project Structure & Module Organization

This repository hosts the static site for `paradorsur.ar`. The previous production site is preserved under `archive/paradorsur-2026-prod/`, including its HTML/PHP pages, `images/`, `images2015/`, `images2023/`, `Templates/`, and `Library/`. New published pages belong in the repository root. `CNAME` defines the production domain. GitHub Pages publishes the root of `master` directly, so anything committed there may become public after deployment, including files in `archive/`.

## Build, Test, and Development Commands

There is no package manager, build step, or automated test suite. From the repository root, run `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000/` to inspect the site locally. Check DNS with `dig paradorsur.ar +noall +answer -t A` when working on hosting. Use `git status --short` before committing to catch accidental assets or private files.

## Coding Style & Naming Conventions

Preserve the existing page structure and Dreamweaver markers when editing legacy HTML. Existing indentation varies; follow the nearby file instead of reformatting unrelated sections. For new standalone HTML, CSS, and JavaScript, use UTF-8, two-space indentation, descriptive names, and lowercase filenames with hyphens (for example, `agenda-reservas.html`). Check image paths relative to each page and provide meaningful `alt` text.

## Testing Guidelines

`test.php` is a legacy page, not an automated test. Open changed pages in a browser, check links and images, and verify desktop and mobile layouts. For print views, inspect print preview on A4. Test interactive controls with fictional data before connecting any real reservation source.

## Commit & Pull Request Guidelines

Recent non-merge commits use short imperative subjects such as `Refine home apartment galleries`; follow that pattern. Keep each commit focused. Pull requests should describe the visible change, list manual checks, and include screenshots for layout changes. Note any hosting or DNS changes explicitly.

## Security & Configuration

Never commit iCal links, tokens, guest phone numbers, payment details, or real guest records. GitHub Pages does not protect files with a login; private reservation data needs authenticated storage elsewhere. Before using `gh`, verify the intended GitHub account and repository access with a read-only API call; SSH access alone does not prove API access.
