## Documentation

This documentation is under construction 🚧

## Reverse Proxy

This program is just running on localhost when it starts server. And finally you should set up your reverse proxy to bind the server to your domain name so make them receive webhook.

### Nginx

You can set up a reverse proxy with nginx, which is widely known for powerful reverse proxy software.

Here, I suppose your running port is 3300, and have already applied for SSL certification for your domain. And here is a possible template for nginx configuration.

```nginx
server {
    listen 80;
    server_name example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    # SSL Certificates
    # Replace to your certification file here.
    ssl_certificate /path/to/your/fullchain.pem;
    ssl_certificate_key /path/to/your/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:3300;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Optional security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

### Caddy

Here is a template configuration for caddy server.

```caddy
# Redirect HTTP to HTTPS
example.com {
    redir https://{host}{uri}
}

# HTTPS server with reverse proxy and SSL
example.com {
    # Enable TLS with automatic certificate generation (Let's Encrypt)
    tls /path/to/your/fullchain.pem /path/to/your/privkey.pem

    # Reverse proxy settings
    reverse_proxy 127.0.0.1:3300

    # Optional security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
    }
}
```
