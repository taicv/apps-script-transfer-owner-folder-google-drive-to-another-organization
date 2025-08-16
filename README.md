# Google Drive Folder Migration Tool for Organizations

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)](https://script.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)](https://github.com/yourusername/apps-script-transfer-owner-folder-google-drive-to-another-organization)

🚀 **Seamlessly migrate Google Drive folders between organizations** with intelligent ownership handling, automatic resumption, and comprehensive error recovery.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This Google Apps Script automates the complex process of migrating Google Drive folders from one organization to another. Whether you're moving from a personal account to a business account, or transferring folders between different G Suite domains, this tool handles ownership conflicts, preserves folder structure, and ensures data integrity.

### Perfect for:
- **Organization migrations** between different Google Workspace domains
- **Account transfers** when switching between personal and business accounts
- **Data consolidation** across multiple Google accounts
- **Backup operations** with ownership preservation

## ✨ Key Features

### 🔄 **Smart Ownership Handling**
- Automatically detects file/folder ownership
- **Moves** files owned by the destination domain
- **Copies** files from external domains to preserve access
- Handles Google Drive shortcuts intelligently

### 🛡️ **Robust Error Recovery**
- **Resumable operations** - automatically continues from where it left off
- Comprehensive error logging with direct Google Drive links
- Duplicate execution prevention
- Safe cleanup with rollback capabilities

### 📁 **Advanced Folder Management**
- Preserves complete folder hierarchy
- Creates `.MIGRATED` temporary folders for safe processing
- Automatic folder renaming after successful migration
- Handles nested folder structures of any depth

### ⚡ **Performance Optimized**
- Efficient processing with progress tracking
- Minimal API calls to reduce quota usage
- Batch operations for improved speed

## 🚀 Quick Start

1. **Copy the script** to your Google Apps Script project
2. **Update the folder URL** in the main function call
3. **Run the migration** function
4. **Monitor progress** in the execution log

```javascript
// Replace with your actual Google Drive folder URL
migrateFolderToMIGRATED("https://drive.google.com/drive/u/0/folders/YOUR_FOLDER_ID");
```

## 📦 Installation

### Method 1: Google Apps Script Editor

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a **New Project**
3. Replace the default code with the contents of `code.js`
4. Save the project with a descriptive name

### Method 2: clasp CLI (Advanced)

```bash
# Install clasp globally
npm install -g @google/clasp

# Clone this repository
git clone https://github.com/yourusername/apps-script-transfer-owner-folder-google-drive-to-another-organization.git
cd apps-script-transfer-owner-folder-google-drive-to-another-organization

# Login to Google
clasp login

# Create new Apps Script project
clasp create --title "Drive Folder Migration Tool"

# Push the code
clasp push
```

## 📖 Usage

### Basic Migration

```javascript
// Run this function to migrate a folder
migrateFolderToMIGRATED("https://drive.google.com/drive/u/0/folders/1YlGF8xF8QCbmM20dC62RuXgfLAjQHlQb");
```

### Resume Interrupted Migration

```javascript
// If migration was interrupted, clear the running flag and resume
clearRunningFlag();
migrateFolderToMIGRATED("YOUR_FOLDER_URL");
```

### Start Fresh Migration

```javascript
// Clear all migration data and start over
clearMigrationData();
migrateFolderToMIGRATED("YOUR_FOLDER_URL");
```

### Getting Your Folder URL

1. Open Google Drive in your browser
2. Navigate to the folder you want to migrate
3. Copy the URL from the address bar
4. It should look like: `https://drive.google.com/drive/u/0/folders/FOLDER_ID`

## ⚙️ Configuration

### Key Functions

| Function | Purpose | Usage |
|----------|---------|-------|
| `migrateFolderToMIGRATED()` | Main migration function | Primary function to run |
| `clearRunningFlag()` | Resume interrupted migration | Use when script stops unexpectedly |
| `clearMigrationData()` | Reset all progress | Use to start completely fresh |

### Migration Behavior

- **Same Domain Files**: Moved (preserves ownership)
- **External Domain Files**: Copied (creates new ownership)
- **Shortcuts**: Resolved and actual content is migrated
- **Folder Structure**: Completely preserved

## 🔧 Troubleshooting

### Common Issues

**🚫 "Migration already running" error**
```javascript
// Solution: Clear the running flag
clearRunningFlag();
```

**📁 "Could not extract folder ID from URL" error**
- Ensure you're using the complete Google Drive folder URL
- URL format: `https://drive.google.com/drive/u/0/folders/FOLDER_ID`

**⏱️ Script timeout on large folders**
- The script automatically saves progress and can be resumed
- Run `clearRunningFlag()` then execute the migration function again

**🔒 Permission denied errors**
- Ensure you have appropriate access to both source and destination locations
- Some files may require manual sharing from the original owner

### Error Logging

All errors are logged with direct Google Drive links for easy access:
- File errors: Include direct link to the problematic file
- Folder errors: Include direct link to the problematic folder

## 📚 API Reference

### Main Functions

#### `migrateFolderToMIGRATED(inputFolderUrl)`
Migrates a Google Drive folder with intelligent ownership handling.

**Parameters:**
- `inputFolderUrl` (string): Complete Google Drive folder URL

**Returns:** void

**Example:**
```javascript
migrateFolderToMIGRATED("https://drive.google.com/drive/u/0/folders/1YlGF8xF8QCbmM20dC62RuXgfLAjQHlQb");
```

#### `clearRunningFlag()`
Clears the migration lock to allow resuming interrupted operations.

#### `clearMigrationData()`
Clears all stored migration progress data for a fresh start.

### Supported URL Formats

The script supports various Google Drive URL formats:
- `https://drive.google.com/drive/u/0/folders/FOLDER_ID`
- `https://drive.google.com/drive/folders/FOLDER_ID`
- Direct folder ID: `FOLDER_ID`

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow Google Apps Script best practices
- Add comprehensive logging for debugging
- Test with various folder structures
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/apps-script-transfer-owner-folder-google-drive-to-another-organization/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/apps-script-transfer-owner-folder-google-drive-to-another-organization/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/apps-script-transfer-owner-folder-google-drive-to-another-organization/wiki)

## 🏷️ Keywords

`google-drive` `google-apps-script` `folder-migration` `organization-transfer` `google-workspace` `data-migration` `automation` `ownership-transfer` `drive-api` `gas` `javascript` `google-cloud`

---

⭐ **Found this helpful?** Give us a star on GitHub!

📧 **Questions?** Open an issue or start a discussion. 
