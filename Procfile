release: npm install && npm run build && python manage.py collectstatic --noinput && python manage.py migrate
web: python manage.py collectstatic --noinput && gunicorn backend.config.wsgi --log-file -
