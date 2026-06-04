module.exports = {
  apps: [
    {
      name:                'bunkers-api',
      script:              'server.js',
      instances:           1,
      autorestart:         true,
      watch:               false,
      max_memory_restart:  '500M',
      error_file:          'logs/error.log',
      out_file:            'logs/out.log',
      log_date_format:     'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        PORT:     3001,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT:     3001,
      },
    },
  ],
};
