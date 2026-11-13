@echo off
setlocal

set "API_DIR=%~dp0..\apps\api"

if not exist "%API_DIR%\node_modules" (
    echo Erreur : les dependances de l'API ne sont pas installees.
    echo Executez d'abord : cd apps\api ^&^& npm install
    exit /b 1
)

pushd "%API_DIR%"
call npm run create-super-admin -- %*
set "EXIT_CODE=%ERRORLEVEL%"
popd

exit /b %EXIT_CODE%
