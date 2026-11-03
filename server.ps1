# =========================================================================
# IRD Sri Lanka - Forced Registration Master System (FRU)
# Lightweight Local Offline Web Server for RAMIS Intranet Workstations
# Requires: No Node.js, No Python, No Internet, No Administrator Privileges
# =========================================================================

$port = 5173
$prefix = "http://localhost:$port/"
$distFolder = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $distFolder)) {
    $distFolder = $PSScriptRoot
}

Write-Host "=========================================================================" -ForegroundColor Yellow
Write-Host " DEPARTMENT OF INLAND REVENUE - SRI LANKA (FRU MASTER INTELLIGENCE)" -ForegroundColor Green
Write-Host " RAMIS INTRANET / AIR-GAPPED AIR-TIGHT WORKSTATION DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Yellow
Write-Host " Local Offline Server Address: $prefix" -ForegroundColor White
Write-Host " Web Content Directory: $distFolder" -ForegroundColor Gray
Write-Host " Ready for RAMIS / Excel Audit Operations. DO NOT CLOSE THIS WINDOW." -ForegroundColor DarkYellow
Write-Host " Press Ctrl+C or close this window to exit the application." -ForegroundColor DarkGray
Write-Host "-------------------------------------------------------------------------"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Port $port is currently in use. Trying alternate port 8080..." -ForegroundColor Yellow
    $port = 8080
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    try {
        $listener.Start()
    } catch {
        $port = 8888
        $prefix = "http://localhost:$port/"
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    }
}

# Automatically launch default browser (Edge / Chrome)
try {
    Start-Process $prefix
} catch {
    Write-Host "Please open your browser manually and visit: $prefix" -ForegroundColor Cyan
}

$mimeTypes = @{
    ".html"   = "text/html; charset=utf-8"
    ".htm"    = "text/html; charset=utf-8"
    ".js"     = "application/javascript; charset=utf-8"
    ".mjs"    = "application/javascript; charset=utf-8"
    ".css"    = "text/css; charset=utf-8"
    ".json"   = "application/json; charset=utf-8"
    ".png"    = "image/png"
    ".jpg"    = "image/jpeg"
    ".jpeg"   = "image/jpeg"
    ".svg"    = "image/svg+xml"
    ".ico"    = "image/x-icon"
    ".woff"   = "font/woff"
    ".woff2"  = "font/woff2"
    ".ttf"    = "font/ttf"
    ".webp"   = "image/webp"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # -------------------------------------------------------------
        # Handle Shared Folder REST API Endpoints for LAN / Network sync
        # -------------------------------------------------------------
        if ($request.Url.LocalPath.StartsWith("/api/shared-folder")) {
            $response.ContentType = "application/json; charset=utf-8"
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")

            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }

            $sharedRepoFolder = $global:SharedFolderPath
            if ([string]::IsNullOrWhiteSpace($sharedRepoFolder)) {
                $sharedRepoFolder = Join-Path ([Environment]::GetFolderPath("Desktop")) "IRD_SHARED_REPOSITORY"
            }
            if (-not (Test-Path $sharedRepoFolder)) {
                New-Item -ItemType Directory -Path $sharedRepoFolder -Force | Out-Null
            }
            $historyFile = Join-Path $sharedRepoFolder "ird_fru_history_master.json"

            if ($request.Url.LocalPath -eq "/api/shared-folder/status") {
                $exists = Test-Path $historyFile
                $cnt = 0
                if ($exists) {
                    try {
                        $rawContent = [System.IO.File]::ReadAllText($historyFile)
                        $parsed = $rawContent | ConvertFrom-Json
                        $cnt = $parsed.Count
                    } catch {}
                }
                $statusObj = @{
                    isLinked = $true
                    folderPath = $sharedRepoFolder
                    totalTransactions = $cnt
                    historyFileExists = $exists
                }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($statusObj | ConvertTo-Json))
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            }
            elseif ($request.Url.LocalPath -eq "/api/shared-folder/load") {
                if (Test-Path $historyFile) {
                    $bytes = [System.IO.File]::ReadAllBytes($historyFile)
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $emptyBytes = [System.Text.Encoding]::UTF8.GetBytes("[]")
                    $response.OutputStream.Write($emptyBytes, 0, $emptyBytes.Length)
                }
            }
            elseif ($request.Url.LocalPath -eq "/api/shared-folder/save" -and $request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $body = $reader.ReadToEnd()
                $parsed = $body | ConvertFrom-Json
                if ($parsed.transactions) {
                    $jsonStr = $parsed.transactions | ConvertTo-Json -Depth 10
                    [System.IO.File]::WriteAllText($historyFile, $jsonStr, [System.Text.Encoding]::UTF8)
                }
                $resObj = @{ success = $true; saved = $true; path = $historyFile }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            }
            elseif ($request.Url.LocalPath -eq "/api/shared-folder/config" -and $request.HttpMethod -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $body = $reader.ReadToEnd()
                $parsed = $body | ConvertFrom-Json
                if ($parsed.folderPath) {
                    $global:SharedFolderPath = $parsed.folderPath
                    if (-not (Test-Path $global:SharedFolderPath)) {
                        New-Item -ItemType Directory -Path $global:SharedFolderPath -Force | Out-Null
                    }
                }
                $resObj = @{ success = $true; folderPath = $global:SharedFolderPath }
                $jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json))
                $response.OutputStream.Write($jsonBytes, 0, $jsonBytes.Length)
            }

            $response.Close()
            continue
        }

        $urlPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath) -or $urlPath -eq '/') {
            $urlPath = "index.html"
        }

        $decodedPath = [System.Uri]::UnescapeDataString($urlPath)
        $targetFile = Join-Path $distFolder $decodedPath

        # Single page application fallback
        if (-not (Test-Path $targetFile -PathType Leaf)) {
            $targetFile = Join-Path $distFolder "index.html"
        }

        if (Test-Path $targetFile -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.Headers.Add("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }

        $response.Close()
    }
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
}
