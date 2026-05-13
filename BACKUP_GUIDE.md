# Data Backup Guide

Your app stores data in Render's ephemeral filesystem. **Data is lost when the container restarts.** Use this backup script before each session.

## Quick Start

### Windows Users:
Double-click `backup.bat` from the `d:\React + Node\Node` folder, or run in terminal:
```bash
.\backup.bat
```

### Mac/Linux Users:
```bash
chmod +x backup.sh
./backup.sh
```

## How It Works

1. The script stages your data files:
   - `src/db/users.json` (registered users)
   - `src/db/items.json` (product items)
   - `uploads/` (product images)

2. Creates a git commit with a timestamp

3. Pushes to GitHub

## When to Run

- **Before starting your dev session** (recover last session's data)
- **After making changes** (save current session's data)
- **Before stopping work** (backup before Render restarts)

## Manual Alternative

If you prefer not to use the script:
```bash
cd "d:\React + Node\Node"
git add src/db/ uploads/
git commit -m "backup: save data"
git push origin main
```

## Important Notes

- Render free tier restarts every 15 minutes of inactivity
- Always run backup before closing VS Code or ending your session
- The backup is only as recent as your last commit
- To restore old data, checkout the commit with `git checkout <commit-hash>`

## Future Improvements

Consider migrating to:
- **MongoDB Atlas** (persistent database)
- **Render Persistent Disk** (persistent storage volume)
- **AWS S3** (for image uploads)

These options eliminate manual backups and automatically persist data.
