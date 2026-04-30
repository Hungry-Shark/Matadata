import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function createVectorIndex() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      project_id: process.env.FIREBASE_PROJECT_ID,
    },
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const projectId = process.env.FIREBASE_PROJECT_ID;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/collectionGroups/knowledge/indexes`;

  try {
    const res = await client.request({
      url,
      method: 'POST',
      data: {
        queryScope: 'COLLECTION',
        fields: [
          {
            fieldPath: 'embedding',
            vectorConfig: {
              dimension: 768,
              flat: {}
            }
          }
        ]
      }
    });

    console.log('Index creation initiated:', res.data);
  } catch (err: any) {
    console.error('Failed to create index:', err.response?.data || err.message);
  }
}

createVectorIndex();
