Write-Host "Procurando instalacoes do Java..." -ForegroundColor Cyan
Write-Host ""

# Verifica JAVA_HOME
Write-Host "JAVA_HOME atual: $env:JAVA_HOME" -ForegroundColor Yellow

# Procura Java no PATH
Write-Host "`nJava no PATH:" -ForegroundColor Yellow
where.exe java 2>&1

# Procura instalações comuns do Java
Write-Host "`nProcurando em locais comuns:" -ForegroundColor Yellow
$javaLocations = @(
    "C:\Program Files\Java",
    "C:\Program Files (x86)\Java",
    "C:\Program Files\Microsoft\jdk*",
    "C:\Program Files\Eclipse Adoptium",
    "C:\Program Files\Zulu",
    "C:\jdk*"
)

foreach ($location in $javaLocations) {
    if (Test-Path $location) {
        Write-Host "Encontrado: $location" -ForegroundColor Green
        Get-ChildItem $location -Directory | ForEach-Object {
            Write-Host "  - $($_.FullName)"
        }
    }
}

# Tenta executar java -version
Write-Host "`nVersao do Java (se disponivel):" -ForegroundColor Yellow
java -version 2>&1