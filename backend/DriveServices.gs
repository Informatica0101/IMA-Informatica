// --- SERVICIOS DE GOOGLE DRIVE ---

/**
 * Busca una carpeta por nombre dentro de una carpeta padre. Si no la encuentra, la crea.
 * @param {GoogleAppsScript.Drive.Folder} parentFolder - La carpeta donde buscar.
 * @param {string} folderName - El nombre de la carpeta a buscar o crear.
 * @returns {GoogleAppsScript.Drive.Folder} La carpeta encontrada o recién creada.
 */
function getOrCreateFolder(parentFolder, folderName) {
  if (!folderName || typeof folderName !== 'string' || folderName.trim() === '') {
    const errorMsg = `El nombre de la carpeta no puede estar vacío. Parent: ${parentFolder.getName()}`;
    logDebug(errorMsg);
    throw new Error(errorMsg);
  }

  const folders = parentFolder.getFoldersByName(folderName.trim());

  if (folders.hasNext()) {
    logDebug(`Carpeta encontrada: "${folderName}" en "${parentFolder.getName()}".`);
    return folders.next();
  } else {
    logDebug(`Creando carpeta: "${folderName}" en "${parentFolder.getName()}".`);
    return parentFolder.createFolder(folderName.trim());
  }
}
