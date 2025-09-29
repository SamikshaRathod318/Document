export const environment = {
  production: true,
  api: {
    baseUrl: 'https://api.dms.yourdomain.com/api',
    timeout: 30000,
    endpoints: {
      auth: '/auth',
      users: '/users',
      documents: '/documents',
      departments: '/departments',
      roles: '/roles',
      workflow: '/workflow'
    }
  },
  auth: {
    tokenKey: 'dms_auth_token_prod',
    refreshTokenKey: 'dms_refresh_token_prod',
    tokenExpiry: 21600, // 6 hours in seconds
    refreshTokenExpiry: 2592000, // 30 days in seconds
    roles: {
      admin: 'admin',
      clerk: 'adm_clerk',
      seniorClerk: 'adm_sr_clerk',
      accountant: 'accountant',
      hod: 'adm_hod'
    }
  },
  app: {
    name: 'Document Management System',
    environment: 'production',
    debug: false,
    version: '1.0.0',
    defaultPageSize: 20
  },
  departments: [
    'Administration',
    'Water',
    'Account',
    'Property',
    'Asset',
    'Electric',
    'Civil',
    'Health',
    'Solid Waste'
  ],
  document: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]
  },
  features: {
    upload: true,
    download: true,
    sharing: true
  },
  externalServices: {
    // googleClientId: 'your-google-client-id-prod',
    // facebookAppId: 'your-facebook-app-id-prod'
  },
  supabase: {
    url: 'https://vnuwevyywuujtskiroyk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudXdldnl5d3V1anRza2lyb3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjUyOTEsImV4cCI6MjA3NDcwMTI5MX0.9y65fxjzWwA9vvLlKcAFAfHEBUGigqJFCB-CHgmtSJ0'
  },
  cors: {
    allowedOrigins: ['https://yourdomain.com']
  },
  logging: {
    level: 'error',
    logToFile: true
  },
  security: {
    enableHttps: true,
    strictTransportSecurity: true
  }
};
