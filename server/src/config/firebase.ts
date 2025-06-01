import admin from 'firebase-admin';
import { config } from './index';

// Validate Firebase configuration
if (!config.firebase.projectId || !config.firebase.privateKey || !config.firebase.clientEmail) {
  throw new Error('Missing required Firebase configuration. Please check your environment variables.');
}

// Create service account configuration from environment variables
const serviceAccount = {
  type: config.firebase.type,
  project_id: config.firebase.projectId,
  private_key_id: config.firebase.privateKeyId,
  private_key: config.firebase.privateKey,
  client_email: config.firebase.clientEmail,
  client_id: config.firebase.clientId,
  auth_uri: config.firebase.authUri,
  token_uri: config.firebase.tokenUri,
  auth_provider_x509_cert_url: config.firebase.authProviderX509CertUrl,
  client_x509_cert_url: config.firebase.clientX509CertUrl,
  universe_domain: config.firebase.universeDomain,
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: config.firebase.storageBucket,
    projectId: config.firebase.projectId,
  });
}

export const db = admin.firestore();
export const storage = admin.storage();
export const auth = admin.auth();

// Set Firestore settings for European region
db.settings({
  timestampsInSnapshots: true,
});

export default admin;
