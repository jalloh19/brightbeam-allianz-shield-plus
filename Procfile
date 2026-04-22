release: npm install && npm run build && python manage.py collectstatic --noinput && python manage.py migrate
web: gunicorn backend.config.wsgi --log-file -
