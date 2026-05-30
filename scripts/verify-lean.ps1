# Verify GoldilocksErdos Lean package (Windows / CI)
$ErrorActionPreference = "Stop"
$elanBin = Join-Path $env:USERPROFILE ".elan\bin"
if (-not (Test-Path $elanBin)) {
  Write-Error "elan not found at $elanBin — install from https://github.com/leanprover/elan"
}
$env:Path = "$elanBin;" + $env:Path
$leanRoot = Join-Path $PSScriptRoot ".." "lean" | Resolve-Path
Set-Location $leanRoot
Write-Host "Building GoldilocksErdos in $leanRoot ..."
lake build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "OK: lake build succeeded"
