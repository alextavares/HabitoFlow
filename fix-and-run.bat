@echo off
echo === Corrigindo HabitoFlow ===
echo.

echo 1. Limpando cache e dependencias...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm cache clean --force

echo.
echo 2. Instalando dependencias limpas...
npm install

echo.
echo 3. Tentando executar com npx direto...
npx react-native@0.79.3 run-android

pause