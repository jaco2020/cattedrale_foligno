$ErrorActionPreference = 'Stop'

$srcRoot = (Resolve-Path 'img').Path
$dstRoot = (Resolve-Path 'img/_originali').Path

$files =
  Get-ChildItem -Path $srcRoot -Recurse -File -Include *.jpg, *.jpeg, *.png |
  Where-Object { $_.FullName -notlike ($dstRoot + '*') } |
  Where-Object { $_.Name -notmatch '-w\d+\.(jpg|jpeg|png)$' }

foreach ($f in $files) {
  $rel = $f.FullName.Substring($srcRoot.Length).TrimStart('\')
  $dst = Join-Path $dstRoot $rel
  $dstDir = Split-Path -Parent $dst

  if (-not (Test-Path $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir | Out-Null
  }

  Move-Item -LiteralPath $f.FullName -Destination $dst
}

Write-Output ("moved: {0}" -f $files.Count)

