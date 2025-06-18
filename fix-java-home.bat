@echo off
echo ========================================
echo   Corrigindo JAVA_HOME
echo ========================================
echo.

echo Procurando instalacoes do Java...
echo.

set JAVA_FOUND=0

REM Verificar locais comuns do Java 17
if exist "C:\Program Files\Java\jdk-17" (
    set JAVA_HOME=C:\Program Files\Java\jdk-17
    set JAVA_FOUND=1
    echo Encontrado: C:\Program Files\Java\jdk-17
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot" (
    set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
    set JAVA_FOUND=1
    echo Encontrado: C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot
) else if exist "C:\Program Files\OpenJDK\jdk-17" (
    set JAVA_HOME=C:\Program Files\OpenJDK\jdk-17
    set JAVA_FOUND=1
    echo Encontrado: C:\Program Files\OpenJDK\jdk-17
) else if exist "C:\Program Files\Java\jdk-17.0.15" (
    set JAVA_HOME=C:\Program Files\Java\jdk-17.0.15
    set JAVA_FOUND=1
    echo Encontrado: C:\Program Files\Java\jdk-17.0.15
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.15.9-hotspot" (
    set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.15.9-hotspot
    set JAVA_FOUND=1
    echo Encontrado: C:\Program Files\Eclipse Adoptium\jdk-17.0.15.9-hotspot
)

if %JAVA_FOUND%==0 (
    echo.
    echo ERRO: Java 17 nao encontrado nos locais padrao!
    echo.
    echo Procurando em todo o sistema...
    dir "C:\Program Files" | findstr /i "jdk.*17"
    dir "C:\Program Files\Java" 2>nul | findstr /i "jdk"
    dir "C:\Program Files\Eclipse Adoptium" 2>nul | findstr /i "jdk"
    echo.
    echo Por favor, instale o Java 17 ou ajuste o caminho manualmente.
    pause
    exit /b 1
)

echo.
echo Configurando JAVA_HOME...
echo JAVA_HOME=%JAVA_HOME%

REM Configurar permanentemente
setx JAVA_HOME "%JAVA_HOME%" >nul 2>&1

REM Adicionar ao PATH se necessario
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo.
echo Verificando instalacao...
"%JAVA_HOME%\bin\java" -version

echo.
echo ========================================
echo JAVA_HOME configurado com sucesso!
echo.
echo Agora execute novamente:
echo npm run android
echo ========================================
echo.
pause