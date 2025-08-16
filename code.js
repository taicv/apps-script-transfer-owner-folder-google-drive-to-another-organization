// Clear the stuck running flag to allow resuming:
clearRunningFlag();

// Function call with your actual Google Drive folder URL
migrateFolderToMIGRATED("https://drive.google.com/drive/u/0/folders/1YlGF8xF8QCbmM20dC62RuXgfLAjQHlQb");

// Helper function to clear just the running flag (for resuming)
function clearRunningFlag() {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('migrationRunning');
  Logger.log('Cleared running flag - ready to resume');
}

// Helper function to clear stored migration data
function clearMigrationData() {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('processedIds');
  scriptProperties.deleteProperty('originalDeleted');
  scriptProperties.deleteProperty('renamedFolder');
  scriptProperties.deleteProperty('migrationRunning');
  Logger.log('Cleared all migration data - starting fresh');
}

function migrateFolderToMIGRATED(inputFolderUrl) {
  var scriptProperties = PropertiesService.getScriptProperties();
  
  // Debug logging
  Logger.log('Function called with inputFolderUrl: ' + inputFolderUrl + ' (type: ' + typeof inputFolderUrl + ')');
  
  // Prevent multiple executions - use a lock
  var isRunning = scriptProperties.getProperty('migrationRunning');
  if (isRunning === 'true') {
    Logger.log('Migration already running, skipping duplicate call');
    return;
  }
  
  // Validate input
  if (!inputFolderUrl || typeof inputFolderUrl !== 'string') {
    Logger.log('Error: inputFolderUrl is required and must be a string');
    Logger.log('Received value: ' + inputFolderUrl + ' (type: ' + typeof inputFolderUrl + ')');
    return;
  }
  
  // Set running flag
  scriptProperties.setProperty('migrationRunning', 'true');
  
  // Parse folder ID from URL - handle different Google Drive URL formats
  var folderId;
  var folderMatch = inputFolderUrl.match(/\/folders\/([-\w]{25,})/);
  if (folderMatch) {
    folderId = folderMatch[1];
  } else {
    // Fallback to the old pattern if the specific folder pattern doesn't match
    var fallbackMatch = inputFolderUrl.match(/[-\w]{25,}/);
    if (fallbackMatch) {
      folderId = fallbackMatch[0];
    } else {
      Logger.log('Error: Could not extract folder ID from URL: ' + inputFolderUrl);
      return;
    }
  }
  var original;
  try {
    original = DriveApp.getFolderById(folderId);
  } catch (e) {
    Logger.log('Error accessing original folder ID: ' + folderId + ' | ' + e.message);
    return;
  }
  
  var parent = original.getParents().hasNext() ? original.getParents().next() : DriveApp.getRootFolder();

  // Function to get existing or create new ".MIGRATED" suffix folder in parent
  function getOrCreateMIGRATEDFolder(parentFolder, baseFolderName) {
    var newName = baseFolderName + '.MIGRATED';
    var folders = parentFolder.getFoldersByName(newName);
    if (folders.hasNext()) {
      var existingFolder = folders.next();
      Logger.log('Found existing .MIGRATED folder: ' + newName);
      return existingFolder;
    } else {
      var createdFolder = parentFolder.createFolder(newName);
      Logger.log('Created new folder: ' + newName);
      return createdFolder;
    }
  }

  var newFolder = getOrCreateMIGRATEDFolder(parent, original.getName());

  // Get destination domain (current user's domain)
  var currentUserEmail = Session.getActiveUser().getEmail();
  var destinationDomain = currentUserEmail.split('@')[1];
  Logger.log('Destination domain: ' + destinationDomain);

  // Helper function to check if owner is in destination domain
  function isOwnerInDestinationDomain(item) {
    var ownerEmail = item.getOwner().getEmail();
    var ownerDomain = ownerEmail.split('@')[1];
    return ownerDomain === destinationDomain;
  }

  // Load processed IDs from properties (for resuming)
  var processedIdsStr = scriptProperties.getProperty('processedIds') || '{}';
  var processedIds = JSON.parse(processedIdsStr);

  // Save processedIds with delay control (to reduce frequent writes)
  function saveProcessedIds() {
    scriptProperties.setProperty('processedIds', JSON.stringify(processedIds));
  }

  // Recursive processing function
  function process(currentOrigFolder, currentDestFolder) {
    var folderId = currentOrigFolder.getId();
    if (processedIds[folderId]) return; // already processed, skip

    // Process files in current folder
    var files = currentOrigFolder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      var fileId = file.getId();
      
      if (processedIds[fileId]) continue; // skip processed file
      
      try {
        var mimeType = file.getMimeType();
        if (mimeType == "application/vnd.google-apps.shortcut") {
          // Shortcut handling
          var targetId = file.getTargetId();
          var targetMime = file.getTargetMimeType();
          if (targetMime == "application/vnd.google-apps.folder") {
            // Shortcut points to folder: recursively copy actual folder
            var shortcutFolder = DriveApp.getFolderById(targetId);
            var newSubFolder = currentDestFolder.createFolder(shortcutFolder.getName());
            Logger.log('Converted shortcut to folder: ' + shortcutFolder.getName() + ' in ' + currentDestFolder.getName());
            process(shortcutFolder, newSubFolder);
          } else {
            // Shortcut points to file: copy actual file
            var targetFile = DriveApp.getFileById(targetId);
            targetFile.makeCopy(targetFile.getName(), currentDestFolder);
            Logger.log('Copied actual file from shortcut: ' + targetFile.getName());
          }
        } else if (file.getOwner().getEmail() == Session.getActiveUser().getEmail()) {
          // Owned by me, move file
          file.moveTo(currentDestFolder);
          Logger.log('Moved file: ' + file.getName() + ' to folder: ' + currentDestFolder.getName());
        } else if (isOwnerInDestinationDomain(file)) {
          // Owned by someone in destination domain, move file
          file.moveTo(currentDestFolder);
          Logger.log('Moved file (same domain): ' + file.getName() + ' owned by ' + file.getOwner().getEmail() + ' to folder: ' + currentDestFolder.getName());
        } else {
          // Not owned by destination domain, make a copy
          file.makeCopy(file.getName(), currentDestFolder);
          Logger.log('Copied file (external domain): ' + file.getName() + ' owned by ' + file.getOwner().getEmail() + ' to folder: ' + currentDestFolder.getName());
        }

        processedIds[fileId] = true;
        saveProcessedIds();
      } catch (e) {
        Logger.log('Error processing file ID: ' + fileId + ' URL: https://drive.google.com/file/d/' + fileId + '/view | Error: ' + e.message);
      }
    }

    // Process subfolders in current folder
    var folders = currentOrigFolder.getFolders();
    while (folders.hasNext()) {
      var sub = folders.next();
      var subId = sub.getId();
      
      if (processedIds[subId]) continue; // skip processed

      try {
        if (sub.getOwner().getEmail() == Session.getActiveUser().getEmail()) {
          // Owned by me, move folder
          sub.moveTo(currentDestFolder);
          Logger.log('Moved folder: ' + sub.getName() + ' to folder: ' + currentDestFolder.getName());
          processedIds[subId] = true;
          saveProcessedIds();
        } else if (isOwnerInDestinationDomain(sub)) {
          // Owned by someone in destination domain, move folder
          sub.moveTo(currentDestFolder);
          Logger.log('Moved folder (same domain): ' + sub.getName() + ' owned by ' + sub.getOwner().getEmail() + ' to folder: ' + currentDestFolder.getName());
          processedIds[subId] = true;
          saveProcessedIds();
        } else {
          // Not owned by destination domain, create new folder and recurse
          var subDest = currentDestFolder.createFolder(sub.getName());
          Logger.log('Created subfolder (external domain): ' + subDest.getName() + ' in folder: ' + currentDestFolder.getName());
          process(sub, subDest);
          processedIds[subId] = true;
          saveProcessedIds();
        }
      } catch (e) {
        Logger.log('Error processing folder ID: ' + subId + ' URL: https://drive.google.com/drive/folders/' + subId + ' | Error: ' + e.message);
      }
    }

    // Mark current folder processed
    processedIds[folderId] = true;
    saveProcessedIds();
  }

  process(original, newFolder);

  // Remove original folder only once, safely
  if (!scriptProperties.getProperty('originalDeleted')) {
    try {
      parent.removeFolder(original);
      scriptProperties.setProperty('originalDeleted', 'true');
      Logger.log('Removed original folder: ' + original.getName());
    } catch (e) {
      Logger.log('Error removing original folder ID: ' + original.getId() + ' | ' + e.message);
    }
  }

  // Rename new folder back to original name only once
  if (!scriptProperties.getProperty('renamedFolder')) {
    try {
      newFolder.setName(original.getName());
      scriptProperties.setProperty('renamedFolder', 'true');
      Logger.log('Renamed folder: ' + newFolder.getName() + ' to ' + original.getName());
    } catch (e) {
      Logger.log('Error renaming folder ID: ' + newFolder.getId() + ' | ' + e.message);
    }
  }
  
  // Clear running flag
  scriptProperties.deleteProperty('migrationRunning');
  Logger.log('Migration completed successfully');
}
