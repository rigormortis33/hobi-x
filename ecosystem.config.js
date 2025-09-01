module.exports = {
  apps: [
    {
      name: 'hobi-x-api',
      script: 'server/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      watch: false,
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true,
      max_memory_restart: '300M'
    }
  ]
};
