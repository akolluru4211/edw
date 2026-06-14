# EdWorld Co - Automated Workspace Validation Script (PowerShell Version)
$allPassed = $true

Write-Host "=== EdWorld Co Automated Validation (PowerShell) ===" -ForegroundColor Cyan

$filesToCheck = @(
  "index.html",
  "index.css",
  "mock_data.js",
  "app.js"
)

# 1. Check file existence
foreach ($file in $filesToCheck) {
  if (Test-Path $file) {
    $size = (Get-Item $file).Length
    Write-Host "✅ [File Exists] $file ($size bytes)" -ForegroundColor Green
  } else {
    Write-Host "❌ [File Missing] $file" -ForegroundColor Red
    $allPassed = $false
  }
}

# 2. Validate index.html content
try {
  $htmlContent = Get-Content "index.html" -Raw
  
  $tagsToCheck = @(
    @{ tag = "<html"; name = "HTML tag" },
    @{ tag = "<head"; name = "Head tag" },
    @{ tag = "<body"; name = "Body tag" },
    @{ tag = "<header"; name = "Header semantic tag" },
    @{ tag = "<aside"; name = "Aside semantic tag" },
    @{ tag = "<main"; name = "Main semantic tag" },
    @{ tag = "<section"; name = "Section semantic tags" },
    @{ tag = "<footer"; name = "Footer semantic tags" },
    @{ tag = "<table"; name = "Table semantic tag" }
  )

  foreach ($item in $tagsToCheck) {
    if ($htmlContent -match [regex]::Escape($item.tag)) {
      Write-Host "✅ [Semantic Tag Check] Found $($item.name)" -ForegroundColor Green
    } else {
      Write-Host "⚠️ [Semantic Tag Warning] Missing $($item.name) in index.html" -ForegroundColor Yellow
    }
  }

  $idsToCheck = @(
    "auth-overlay",
    "onboarding-overlay",
    "app-layout",
    "global-search-input",
    "btn-toggle-notifications",
    "dropdown-notifications",
    "view-dashboard",
    "view-courses",
    "view-projects",
    "view-connections",
    "view-messages",
    "view-leaderboard",
    "view-profile",
    "view-search",
    "general-modal",
    "toast-container"
  )

  foreach ($id in $idsToCheck) {
    if ($htmlContent -match "id=`"$id`"") {
      Write-Host "✅ [Unique ID Check] Found id=`"$id`"" -ForegroundColor Green
    } else {
      Write-Host "❌ [Unique ID Error] Missing required id=`"$id`" in index.html" -ForegroundColor Red
      $allPassed = $false
    }
  }

} catch {
  Write-Host "❌ Failed to parse index.html content" -ForegroundColor Red
  $allPassed = $false
}

if ($allPassed) {
  Write-Host "🎉 ALL AUTOMATED VERIFICATION CHECKS PASSED!" -ForegroundColor Green
  Exit 0
} else {
  Write-Host "❌ SOME VERIFICATION CHECKS FAILED. See details above." -ForegroundColor Red
  Exit 1
}
