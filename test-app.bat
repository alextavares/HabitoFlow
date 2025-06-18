@echo off
echo Testando HabitoFlow...
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
set ANDROID_HOME=C:\Users\Alexandre\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%

echo Aguardando emulador...
timeout /t 10

echo Executando app...
npx react-native run-android --port 8083