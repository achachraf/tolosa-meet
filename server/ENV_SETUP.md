# Environment Configuration

This project uses environment variables to manage configuration, including Firebase Admin SDK credentials.

## Environment Files

- `.env` - Production environment variables with placeholder values
- `.env.local` - Development environment variables with actual values (not committed to Git)

## Setup Instructions

### Development Setup

1. Copy the example environment file:
   ```bash
   cp .env .env.local
   ```

2. Fill in the actual Firebase credentials in `.env.local`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_CLIENT_X509_CERT_URL`
   - `FIREBASE_STORAGE_BUCKET`

### Production Setup

1. Set all environment variables in your production environment
2. Ensure all `FIREBASE_*` variables are properly configured
3. The application will automatically use `.env` for production and `.env.local` for development

## Firebase Configuration

The Firebase Admin SDK is configured using environment variables instead of a JSON service account file. This approach:

- Prevents committing sensitive credentials to version control
- Allows for different configurations per environment
- Follows security best practices

## Security Notes

- Never commit `.env.local` to version control
- The JSON service account file should also not be committed
- Use secure environment variable management in production (e.g., AWS Secrets Manager, Azure Key Vault, etc.)
