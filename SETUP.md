# Setup Instructions

## Requirements
- [DDEV](https://ddev.readthedocs.io/en/stable/) installed
- [Docker](https://www.docker.com/) running
- [Node.js](https://nodejs.org/) installed
- [Composer](https://getcomposer.org/) installed

---

## 1. Clone the repo

```bash
git clone https://github.com/bjarnib23/fkr-github-repo.git
cd fkr-github-repo
```

---

## 2. Start Drupal (DDEV)

```bash
cd drupal
ddev start
composer install
ddev import-db --file=../db.sql.gz
ddev drush deploy
ddev drush cr
```

Drupal runs at: `https://fkr-web.ddev.site`
Admin login: `ddev drush uli`

---

## 3. Start React

```bash
cd react
npm install
npm run dev
```

React runs at: `http://localhost:5173`

---

## 4. Stripe (optional, for gift card payments)

```bash
stripe listen --forward-to http://fkr-web.ddev.site/api/stripe/webhook
```

Add the following to `drupal/web/sites/default/settings.php`:

```php
$settings['stripe_secret_key'] = 'sk_test_...';
$settings['stripe_publishable_key'] = 'pk_test_...';
$settings['stripe_webhook_secret'] = 'whsec_...';
```
