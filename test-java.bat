@echo off
echo Testando configuracao do Java...
echo.

echo 1. Verificando JAVA_HOME:
echo JAVA_HOME = %JAVA_HOME%
echo.

echo 2. Verificando versao do Java:
java -version 2>&1
echo.

echo 3. Verificando versao do Javac:
javac -version 2>&1
echo.

echo 4. Limpando cache do Gradle:
cd android
call gradlew clean
cd ..
echo.

echo 5. Testando build do Android:
npx react-native run-android