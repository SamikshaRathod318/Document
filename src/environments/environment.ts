export const environment = {
  production: false,
  api: {
    baseUrl: 'http://localhost:3000/api',
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
    tokenKey: 'dms_auth_token',
    refreshTokenKey: 'dms_refresh_token',
    tokenExpiry: 28800, // 8 hours in seconds
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
    environment: 'development',
    debug: true,
    version: '1.0.0',
    defaultPageSize: 10
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
  externalServices: {
    // googleClientId: 'your-google-client-id',
    // facebookAppId: 'your-facebook-app-id'
  },
  cors: {
    allowedOrigins: ['http://localhost:4200', 'http://localhost:3000']
  },
  logging: {
    level: 'debug',
    logToFile: true
  },
  security: {
    enableHttps: false,
    strictTransportSecurity: false
  }
};
