module.exports = {
  apps: [
    {
      name: 'todo-backend',
      cwd: '/home/chenyi/.openclaw/workspace/projects/todo-platform/backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'mysql://user:password@120.55.190.237:3306/todo_platform'
      },
      error_file: '/home/chenyi/.openclaw/workspace/projects/todo-platform/pm2-error.log',
      out_file: '/home/chenyi/.openclaw/workspace/projects/todo-platform/pm2-out.log',
      log_file: '/home/chenyi/.openclaw/workspace/projects/todo-platform/pm2-combined.log',
      time: true,
      merge_logs: true
    },
    {
      name: 'todo-frontend',
      cwd: '/home/chenyi/.openclaw/workspace/projects/todo-platform',
      script: 'node_modules/.bin/vite',
      args: '--port 3457 --host',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3457
      },
      error_file: '/home/chenyi/.openclaw/workspace/projects/todo-platform/pm2-frontend-error.log',
      out_file: '/home/chenyi/.openclaw/workspace/projects/todo-platform/pm2-frontend-out.log',
      log_file: '/home/chenyi/.openclaw/workspace/projects/todo-platform/pm2-frontend-combined.log',
      time: true,
      merge_logs: true
    }
  ]
};
