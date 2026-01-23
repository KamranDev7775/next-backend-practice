import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await params;
    const fileName = filename.join('/');
    console.log('Requested file:', fileName);
    
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const files = readdirSync(uploadsDir);
    const matchedFile = files.find(file => file.startsWith(fileName));
    
    if (!matchedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    const filePath = path.join(uploadsDir, matchedFile);
    console.log('Matched file:', matchedFile);
    
    const file = readFileSync(filePath);
    const ext = path.extname(matchedFile).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.pdf') contentType = 'application/pdf';
    else if (['.doc', '.docx'].includes(ext)) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    return new NextResponse(file, {
      headers: { 'Content-Type': contentType },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}