@echo off
echo =====================================================================
echo                Rent-a-Tool Database Migration Script
echo =====================================================================
echo.
echo Select which environment you want to migrate:
echo.
echo [1] Local Database
echo     (Runs "npx prisma migrate dev" to update local DB and types)
echo.
echo [2] Production / Render Database 
echo     (Runs "npx prisma migrate deploy" to apply pending migrations)
echo     NOTE: You must temporarily put your Render DATABASE_URL in your 
echo           backend/.env file for this to work from your local machine,
echo           or trigger a "Manual Deploy - Clear build cache & deploy"
echo           on your Render dashboard.
echo.

set /p choice="Enter choice (1, 2, or Q to quit): "

if /I "%choice%"=="Q" exit /B

cd backend

if "%choice%"=="1" goto opt1
if "%choice%"=="2" goto opt2
goto invalid

:opt1
echo.
echo Running local migration...
npx prisma migrate dev
goto end

:opt2
echo.
echo Running production migration...
echo.
echo WARNING: Ensure your backend/.env DATABASE_URL is pointing to Render!
pause
npx prisma migrate deploy
goto end

:invalid
echo.
echo Invalid selection.

:end
echo.
echo Done.
pause
