import { pdfToText } from 'pdf-ts';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  region: process.env.S3_UPLOAD_REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY!,
    secretAccessKey: process.env.S3_UPLOAD_SECRET!
  }
});

export async function scrapePdfContent(pdfUrl: string) {
  try {
    // Parse the S3 URL to get bucket and key
    const url = new URL(pdfUrl);
    const bucket = process.env.S3_UPLOAD_BUCKET!;
    const key = decodeURIComponent(url.pathname.slice(1));

    // Get the file directly from S3
    const { Body } = await s3.getObject({
      Bucket: bucket,
      Key: key
    }).promise();

    if (!Body) {
      throw new Error('Failed to fetch PDF from S3');
    }

    // Convert the response to text
    const text = await pdfToText(new Uint8Array(Body as Buffer));
    return text;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}
