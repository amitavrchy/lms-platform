$ErrorActionPreference = 'Stop'

# Resolve service directories independently of the caller's working directory.
$serverPath = Split-Path -Parent $PSScriptRoot
$workspacePath = Split-Path -Parent $serverPath
$clientPath = Join-Path $workspacePath 'Client'
$aiPath = Join-Path $workspacePath 'ai'
$nodeExe = (Get-Command node -ErrorAction Stop).Source

function Start-LearnoraProcess {
    param(
        [string]$Name,
        [int]$Port,
        [string]$WorkingDirectory,
        [string]$Executable,
        [string[]]$LaunchArguments
    )

    $listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    if ($listener) {
        Write-Host "$Name is already listening on port $Port."
        return
    }

    if (-not (Test-Path -LiteralPath $Executable -PathType Leaf)) {
        throw "$Name executable is missing: $Executable. Install the service dependencies first."
    }

    $logPath = Join-Path $WorkingDirectory '.logs'
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
    $started = Start-Process -FilePath $Executable -ArgumentList $LaunchArguments `
        -WorkingDirectory $WorkingDirectory -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $logPath 'dev.stdout.log') `
        -RedirectStandardError (Join-Path $logPath 'dev.stderr.log') -PassThru
    Write-Host "$Name started (PID $($started.Id)). Logs: $logPath"
}

function Wait-LearnoraEndpoint {
    param([string]$Name, [string]$Url)
    $deadline = (Get-Date).AddSeconds(45)
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) {
                Write-Host "$Name ready: $Url"
                return
            }
        } catch {
            # Development servers may still be compiling or opening connections.
        }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $deadline)
    throw "$Name did not become ready at $Url. Check its .logs directory and service configuration."
}

$nextCli = Join-Path $clientPath 'node_modules\next\dist\bin\next'
$nestCli = Join-Path $serverPath 'node_modules\@nestjs\cli\bin\nest.js'
$pythonExe = Join-Path $aiPath '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $nextCli)) { throw 'Install Client dependencies with npm install in Client/.' }
if (-not (Test-Path -LiteralPath $nestCli)) { throw 'Install Server dependencies with npm install in Server/.' }

Start-LearnoraProcess -Name 'Client' -Port 3000 -WorkingDirectory $clientPath `
    -Executable $nodeExe -LaunchArguments @("`"$nextCli`"", 'dev', '--port', '3000')
Start-LearnoraProcess -Name 'Server' -Port 4000 -WorkingDirectory $serverPath `
    -Executable $nodeExe -LaunchArguments @("`"$nestCli`"", 'start', '--watch')
Start-LearnoraProcess -Name 'AI' -Port 8002 -WorkingDirectory $aiPath `
    -Executable $pythonExe -LaunchArguments @('-m', 'uvicorn', 'app.main:app', '--reload', '--host', '127.0.0.1', '--port', '8002')

Wait-LearnoraEndpoint -Name 'Client' -Url 'http://localhost:3000'
Wait-LearnoraEndpoint -Name 'Server catalog' -Url 'http://localhost:4000/catalog/courses'
Wait-LearnoraEndpoint -Name 'AI health' -Url 'http://127.0.0.1:8002/health'

Write-Host ''
Write-Host 'Learnora is running: http://localhost:3000'
Write-Host 'API documentation: http://localhost:4000/docs'
Write-Host 'AI documentation: http://127.0.0.1:8002/docs'
