@echo off
setlocal

set "ENV_FILE=%~dp0..\apps\api\.env.development.local"

if not exist "%~dp0..\apps\api" (
    echo Erreur : le dossier apps\api est introuvable.
    exit /b 1
)

if not exist "%ENV_FILE%" type nul > "%ENV_FILE%"

findstr /b /c:"JWT_SECRET=" "%ENV_FILE%" >nul 2>&1
if not errorlevel 1 (
    echo JWT_SECRET existe deja dans %ENV_FILE%
    exit /b 0
)

for /f "delims=" %%S in ('powershell -NoProfile -Command "$bytes = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()"') do set "JWT_SECRET=%%S"

if not defined JWT_SECRET (
    echo Erreur : impossible de generer JWT_SECRET.
    exit /b 1
)

>>"%ENV_FILE%" echo.
>>"%ENV_FILE%" echo JWT_SECRET=%JWT_SECRET%
echo JWT_SECRET a ete ajoute dans %ENV_FILE%
