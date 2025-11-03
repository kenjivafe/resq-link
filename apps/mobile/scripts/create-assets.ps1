$dir = Join-Path -Path $PSScriptRoot -ChildPath "..\assets"
$dir = [System.IO.Path]::GetFullPath($dir)

if (-not (Test-Path -Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

$base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8+B8AAwMB/6XkY6kAAAAASUVORK5CYII="
$bytes = [Convert]::FromBase64String($base64)
$files = @("icon.png", "adaptive-icon.png", "splash.png", "favicon.png")

foreach ($name in $files) {
    $target = Join-Path -Path $dir -ChildPath $name
    [IO.File]::WriteAllBytes($target, $bytes)
}
