# Auto-Push Setup

This project includes optional tools to automatically commit and push local changes to the `origin` repository.

There are two mechanisms included:

1. A tracked `post-commit` hook template (`scripts/hooks/post-commit`) and an installer script (`scripts/install-hooks.ps1`) that copies the hook into `.git/hooks`.
   - This hook runs after every commit and attempts to `git push origin <branch>`.
   - The hook is best installed once per local clone by running the installer.

2. A file-watcher script (`scripts/auto-push.js`) that watches the repository for file changes and automatically runs `git add -A`, `git commit -m "chore(auto)..."`, and `git push origin HEAD`.
   - Start it with: `npm run autopush` (see note about credentials below).
   - It debounces rapid changes to avoid repeated commits.

## Security & Credentials

- Both mechanisms require that your local environment can push to GitHub non-interactively.
  - Recommended: Configure SSH keys with the GitHub account and use `git@github.com:...` remote, or enable the Git Credential Manager to cache HTTP(S) credentials.
- Be cautious: automatic commits may capture secrets if `.env` or sensitive files are changed. Ensure `.gitignore` correctly excludes secrets and data files.

## How to Install the Hook (one-time)

Open PowerShell in the repository root and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.
\scripts\install-hooks.ps1
```

After installing, make a commit to test: `git commit --allow-empty -m "test hook"` — the hook will attempt to push.

## How to Run the Watcher

Install dependencies (adds `chokidar`):

```powershell
npm install chokidar --save
```

Run the watcher:

```powershell
npm run autopush
```

## Notes and Best Practices

- DO NOT enable auto-push on machines that build or generate secrets automatically unless you are certain those files are ignored.
- Use descriptive commit messages locally when necessary; the watcher uses timestamped messages by default.
- The hook is intentionally lenient: push failures are ignored so your commit workflow is not blocked.

## Troubleshooting

- If pushes fail due to authentication, configure SSH keys or Git Credential Manager:
  - SSH key setup: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
  - Git Credential Manager: https://github.com/GitCredentialManager/git-credential-manager

- If the hook doesn't run after installation, ensure the file at `.git/hooks/post-commit` is executable on Unix-like systems (`chmod +x .git/hooks/post-commit`).
