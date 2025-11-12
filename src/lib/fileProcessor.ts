import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ParsedMessage, sanitizeFilename } from './whatsappParser';

export async function processUploadedFile(file: File): Promise<string> {
  if (file.name.endsWith('.txt')) {
    return await file.text();
  } else if (file.name.endsWith('.zip')) {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    // Find the first .txt file in the zip
    const txtFiles = Object.keys(contents.files).filter(name => name.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
      throw new Error('No .txt file found in the ZIP archive');
    }
    
    const txtFile = contents.files[txtFiles[0]];
    return await txtFile.async('text');
  } else {
    throw new Error('Unsupported file format. Please upload a .txt or .zip file.');
  }
}

export async function exportMessages(
  messages: ParsedMessage[],
  format: 'txt' | 'json'
): Promise<void> {
  const zip = new JSZip();
  
  messages.forEach((msg, index) => {
    const filename = `${sanitizeFilename(msg.message)}-${index}.${format}`;
    
    let content: string;
    if (format === 'json') {
      content = JSON.stringify({
        date: msg.date,
        time: msg.time,
        sender: msg.sender,
        message: msg.message
      }, null, 2);
    } else {
      content = `Date: ${msg.date}\nTime: ${msg.time}\nSender: ${msg.sender}\n\n${msg.message}`;
    }
    
    zip.file(filename, content);
  });
  
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `whatsapp-export-${Date.now()}.zip`);
}
