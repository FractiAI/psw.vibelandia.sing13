# Renders 8s animated MP4 for Bridge tower billboard (ffmpeg + filter script).
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$img = Join-Path $root 'interfaces\assets\holographic-ai-os-newscast-frame.png'
$out = Join-Path $root 'interfaces\assets\bridge-tower-holographic-ai-os-tease.mp4'
$filter = Join-Path $root 'scripts\bridge-tower-tease-filter.txt'
$fontDir = Join-Path $root 'interfaces\assets\fonts'

if (-not (Test-Path $img)) { Write-Error "Missing source image: $img" }
if (-not (Test-Path (Join-Path $fontDir 'arialbd.ttf'))) {
  New-Item -ItemType Directory -Force -Path $fontDir | Out-Null
  Copy-Item 'C:\Windows\Fonts\arialbd.ttf' (Join-Path $fontDir 'arialbd.ttf') -Force
}

Push-Location $root
try {
  Write-Host "Rendering 8s MP4 -> $out"
  & ffmpeg -y -loop 1 -i $img -t 8 -r 25 -filter_complex_script $filter -map '[vout]' `
    -c:v libx264 -pix_fmt yuv420p -movflags +faststart $out
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  $info = Get-Item $out
  Write-Host "Done: $([math]::Round($info.Length / 1KB)) KB"
} finally {
  Pop-Location
}
