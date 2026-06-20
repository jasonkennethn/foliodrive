# PythonAnywhere Setup Guide for FolioDrive Backend

This guide walks you through deploying the Django backend for **FolioDrive** on [PythonAnywhere](https://www.pythonanywhere.com/).

### Backend Details:
- **Domain URL**: `https://foliodrives.pythonanywhere.com`
- **Code Directory**: `/home/foliodrives/portfolio`
- **Static Files Directory**: `/home/foliodrives/portfolio/backend/staticfiles/`
- **Media Files Directory**: `/home/foliodrives/portfolio/backend/media/`

---

## Step 1: Clone or Update the Codebase on PythonAnywhere

1. Open a **Bash Console** in your PythonAnywhere account.
2. If the folder `/home/foliodrives/portfolio` already exists but is not a git repository (or if you want to start fresh), rename it to back up any files and then clone the repository:
   ```bash
   mv /home/foliodrives/portfolio /home/foliodrives/portfolio_backup
   git clone https://github.com/jasonkennethn/foliodrive.git /home/foliodrives/portfolio
   ```
   If it is already cloned and configured as a git repository, simply pull the latest changes:
   ```bash
   cd /home/foliodrives/portfolio
   git pull origin main
   ```

---

## Step 2: Create a Virtual Environment

Set up a virtual environment running Python 3.10+ (matching your project requirements) and install dependencies.

1. Navigate to your project folder:
   ```bash
   cd /home/foliodrives/portfolio
   ```
2. Create the virtual environment:
   ```bash
   mkvirtualenv portfolio_env --python=python3.10
   ```
   *(Note: This creates the environment and activates it. You will see `(portfolio_env)` in your prompt).*
3. Install dependencies from `requirements.txt`:
   ```bash
   pip install -r backend/requirements.txt
   ```

---

## Step 3: Configure the Environment Variables (`.env`)

Create a `.env` file in `/home/foliodrives/portfolio/backend/` containing all production secrets.

1. Create and open the `.env` file for editing:
   ```bash
   nano /home/foliodrives/portfolio/backend/.env
   ```
2. Paste the following configuration, replacing the values as needed (especially the secrets):
   ```ini
   # Django Configuration
   SECRET_KEY=your_django_production_secret_key_here
   DEBUG=False

   # Gemini API Configuration
   GEMINI_API_KEY=your_gemini_api_key_here

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
   CLOUDINARY_API_KEY=your_cloudinary_api_key_here
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here

   # Supabase PostgreSQL Connection Pooler Endpoint
   DB_HOST=db.qngorcmzelesojkoqemm.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_supabase_db_password_here
   ```
3. Save the file (`Ctrl + O`, then `Enter`), and exit nano (`Ctrl + X`).

---

## Step 4: Run Migrations and Collect Static Files

Since we are using Supabase PostgreSQL, we need to run migrations to set up the DB schemas on Supabase.

1. Navigate to the backend directory:
   ```bash
   cd /home/foliodrives/portfolio/backend
   ```
2. Run database migrations:
   ```bash
   python manage.py migrate
   ```
3. Collect all static files for production serving:
   ```bash
   python manage.py collectstatic --noinput
   ```

---

## Step 5: Configure the Web App on PythonAnywhere

1. Go to the **Web** tab on the PythonAnywhere dashboard.
2. Click **Add a new web app** (choose **Manual Configuration** and **Python 3.10**).
3. Set the directory configurations:
   - **Source code**: `/home/foliodrives/portfolio/backend`
   - **Working directory**: `/home/foliodrives/portfolio/backend`
   - **Virtualenv**: `/home/foliodrives/.virtualenvs/portfolio_env` (or whatever virtualenv path was outputted by `mkvirtualenv`)
4. In the **Static files** section, add the mapping rules:
   - **Static files rule 1**:
     - **URL**: `/static/`
     - **Path**: `/home/foliodrives/portfolio/backend/staticfiles/`
   - **Static files rule 2**:
     - **URL**: `/media/`
     - **Path**: `/home/foliodrives/portfolio/backend/media/`

---

## Step 6: Edit the WSGI Configuration File

1. In the **Web** tab under the **Code** section, click on the **WSGI configuration file** link (it looks like `/var/www/foliodrives_pythonanywhere_com_wsgi.py`).
2. Replace its entire contents with the following:
   ```python
   import os
   import sys

   # Add project and backend directories to system path
   path = '/home/foliodrives/portfolio/backend'
   if path not in sys.path:
       sys.path.append(path)

   # Set django settings module environment variable
   os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

   # Setup Django WSGI handler
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```
3. Save the file.

---

## Step 7: Reload and Verify

1. Go back to the **Web** tab on PythonAnywhere.
2. Click the green **Reload** button at the top.
3. Visit `https://foliodrives.pythonanywhere.com/api/admin/users/` or `https://foliodrives.pythonanywhere.com/admin/` to verify the backend is running correctly.

---
*Note: Make sure your Supabase project is active and that the connection password is correct (`Nerellas@123`). If you see a database error in the logs, verify connection parameters in the `/home/foliodrives/portfolio/backend/.env` file.*
