const { execFile } = require("child_process");
const path = require("path");

const repoRoot = path.join(__dirname, "../..");
let running = false;
let queued = false;

const runCommand = (args) => {
  return new Promise((resolve, reject) => {
    execFile("git", args, { cwd: repoRoot }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout);
    });
  });
};

const normalizeRepo = (value) => {
  if (!value) {
    return "";
  }

  return value
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");
};

const doBackup = async (reason) => {
  const enabled = process.env.AUTO_GIT_BACKUP === "true";

  if (!enabled) {
    return;
  }

  try {
    await runCommand(["add", "src/db/users.json", "src/db/items.json", "uploads"]);

    let hasChanges = true;
    try {
      await runCommand(["diff", "--cached", "--quiet"]);
      hasChanges = false;
    } catch (_err) {
      hasChanges = true;
    }

    if (!hasChanges) {
      return;
    }

    const authorName = process.env.GIT_AUTHOR_NAME || "Render Auto Backup";
    const authorEmail = process.env.GIT_AUTHOR_EMAIL || "render-backup@local";

    await runCommand(["config", "user.name", authorName]);
    await runCommand(["config", "user.email", authorEmail]);

    const stamp = new Date().toISOString();
    await runCommand(["commit", "-m", `backup: ${reason} (${stamp})`]);

    const pushTarget = process.env.GIT_PUSH_TARGET || "HEAD:main";
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = normalizeRepo(process.env.GITHUB_REPO);

    if (githubToken && githubRepo) {
      const remoteUrl = `https://x-access-token:${encodeURIComponent(githubToken)}@github.com/${githubRepo}.git`;
      await runCommand(["push", remoteUrl, pushTarget]);
    } else {
      await runCommand(["push", "origin", pushTarget]);
    }

    console.log("[auto-backup] GitHub backup pushed successfully");
  } catch (error) {
    console.error("[auto-backup] GitHub backup failed:", error.message);
  }
};

exports.backupToGitHub = async (reason) => {
  if (running) {
    queued = true;
    return;
  }

  running = true;
  await doBackup(reason);
  running = false;

  if (queued) {
    queued = false;
    exports.backupToGitHub("queued-data-change");
  }
};
