import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ParsedMessage, sanitizeFilename } from './whatsappParser';

export interface ProcessedFile {
  chatContent: string;
  mediaFiles: Map<string, Blob>; // filename -> blob
}

export async function processUploadedFile(file: File): Promise<ProcessedFile> {
  const mediaFiles = new Map<string, Blob>();
  let chatContent = '';

  if (file.name.endsWith('.txt')) {
    chatContent = await file.text();
  } else if (file.name.endsWith('.zip')) {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    // Find the first .txt file in the zip
    const txtFiles = Object.keys(contents.files).filter(name => 
      name.endsWith('.txt') && !contents.files[name].dir
    );
    
    if (txtFiles.length === 0) {
      throw new Error('No .txt file found in the ZIP archive');
    }
    
    const txtFile = contents.files[txtFiles[0]];
    chatContent = await txtFile.async('text');

    // Extract all media files from the ZIP
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.3gp', '.avi', '.mov', '.opus', '.mp3', '.m4a', '.aac', '.ogg', '.pdf', '.docx', '.xlsx', '.zip'];
    
    for (const [filename, fileData] of Object.entries(contents.files)) {
      if (!fileData.dir && mediaExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
        const blob = await fileData.async('blob');
        // Store with just the filename, not the full path
        const baseFilename = filename.split('/').pop() || filename;
        mediaFiles.set(baseFilename, blob);
      }
    }
  } else {
    throw new Error('Unsupported file format. Please upload a .txt or .zip file.');
  }

  return { chatContent, mediaFiles };
}

export async function exportMessages(
  messages: ParsedMessage[],
  format: 'txt' | 'json',
  mediaFiles: Map<string, Blob> = new Map()
): Promise<void> {
  const zip = new JSZip();
  
  messages.forEach((msg, index) => {
    const baseName = sanitizeFilename(msg.message);
    const folderName = `message-${index + 1}-${baseName}`;
    const folder = zip.folder(folderName);
    
    if (!folder) return;
    
    // Add the message text file
    const filename = `message.${format}`;
    let content: string;
    if (format === 'json') {
      content = JSON.stringify({
        date: msg.date,
        time: msg.time,
        sender: msg.sender,
        message: msg.message,
        mediaFiles: msg.mediaFiles || []
      }, null, 2);
    } else {
      content = `Date: ${msg.date}\nTime: ${msg.time}\nSender: ${msg.sender}\n\n${msg.message}`;
      if (msg.mediaFiles && msg.mediaFiles.length > 0) {
        content += `\n\n--- Attached Media ---\n${msg.mediaFiles.join('\n')}`;
      }
    }
    
    folder.file(filename, content);
    
    // Add any media files associated with this message
    if (msg.mediaFiles && msg.mediaFiles.length > 0) {
      msg.mediaFiles.forEach(mediaFilename => {
        const mediaBlob = mediaFiles.get(mediaFilename);
        if (mediaBlob) {
          folder.file(mediaFilename, mediaBlob);
        }
      });
    }
  });
  
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `whatsapp-export-${Date.now()}.zip`);
}
