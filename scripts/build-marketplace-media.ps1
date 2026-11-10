param(
  [string]$SourceDirectory = "marketplace-assets\screenshots",
  [string]$OutputDirectory = "..\Vibe96-Resubmission-FlowPilot-v1.5.6\02-Media"
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$source = [System.IO.Path]::GetFullPath((Join-Path $workspace $SourceDirectory))
$output = [System.IO.Path]::GetFullPath((Join-Path $workspace $OutputDirectory))
$wideOutput = Join-Path $output "01-Exact-400x225"
$masterOutput = Join-Path $output "02-Upload-Masters-1600x900"
$squareOutput = Join-Path $output "03-List-Image-1080x1080"
New-Item -ItemType Directory -Force $wideOutput, $masterOutput, $squareOutput | Out-Null

function New-Canvas([int]$width, [int]$height) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Canvas($canvas, [string]$path) {
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose(); $canvas.Bitmap.Dispose()
}

function Draw-Cover([int]$width, [int]$height, [string]$path, [bool]$square) {
  $canvas = New-Canvas $width $height
  $graphics = $canvas.Graphics
  $background = [System.Drawing.Image]::FromFile((Join-Path $workspace "public\product\cover-background-v2.png"))
  $graphics.DrawImage($background, 0, 0, $width, $height); $background.Dispose()
  $shade = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(0, 0, $width, $height),
    [System.Drawing.Color]::FromArgb(245, 3, 8, 28),
    [System.Drawing.Color]::FromArgb(20, 3, 8, 28), 0)
  $graphics.FillRectangle($shade, 0, 0, $width, $height); $shade.Dispose()

  $scale = if ($square) { $width / 1080.0 } else { $width / 1600.0 }
  $left = if ($square) { 72 * $scale } else { 86 * $scale }
  $brandFont = [System.Drawing.Font]::new("Segoe UI", 24 * $scale, [System.Drawing.FontStyle]::Bold)
  $titleSize = if ($square) { 70 } else { 78 }
  $titleFont = [System.Drawing.Font]::new("Segoe UI", $titleSize * $scale, [System.Drawing.FontStyle]::Bold)
  $subtitleFont = [System.Drawing.Font]::new("Segoe UI", 25 * $scale, [System.Drawing.FontStyle]::Regular)
  $pillFont = [System.Drawing.Font]::new("Segoe UI", 16 * $scale, [System.Drawing.FontStyle]::Bold)
  $cyan = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(83, 232, 255))
  $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(215, 229, 240))
  $graphics.DrawString("FLOWPILOT", $brandFont, $cyan, $left, 52 * $scale)
  $graphics.DrawString("CRM", $titleFont, [System.Drawing.Brushes]::White, $left - (6 * $scale), 82 * $scale)
  $subtitleY = if ($square) { 200 * $scale } else { 190 * $scale }
  $graphics.DrawString("Clients. Projects. Delivery.", $subtitleFont, $muted, $left, $subtitleY)
  $pillY = if ($square) { 272 * $scale } else { 250 * $scale }
  $pillX = $left
  foreach ($pill in @("CRM PIPELINE", "KANBAN TASKS", "LIVE ANALYTICS")) {
    $graphics.DrawString($pill, $pillFont, [System.Drawing.Brushes]::White, $pillX, $pillY)
    $pillX += $graphics.MeasureString($pill, $pillFont).Width + (28 * $scale)
  }
  $stackY = if ($square) { 930 * $scale } else { 820 * $scale }
  $graphics.DrawString("NEXT.JS  /  PRISMA  /  MONGODB", $pillFont, [System.Drawing.Brushes]::White, $left, $stackY)
  $brandFont.Dispose(); $titleFont.Dispose(); $subtitleFont.Dispose(); $pillFont.Dispose(); $cyan.Dispose(); $muted.Dispose()
  Save-Canvas $canvas $path
}

function Draw-Feature([hashtable]$item, [int]$width, [int]$height, [string]$path) {
  $canvas = New-Canvas $width $height
  $graphics = $canvas.Graphics
  $scale = $width / 1600.0
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(0, 0, $width, $height),
    [System.Drawing.Color]::FromArgb(5, 8, 20),
    [System.Drawing.Color]::FromArgb(12, 31, 68), 35)
  $graphics.FillRectangle($background, 0, 0, $width, $height); $background.Dispose()
  $brandFont = [System.Drawing.Font]::new("Segoe UI", 22 * $scale, [System.Drawing.FontStyle]::Bold)
  $titleFont = [System.Drawing.Font]::new("Segoe UI", 46 * $scale, [System.Drawing.FontStyle]::Bold)
  $labelFont = [System.Drawing.Font]::new("Segoe UI", 18 * $scale, [System.Drawing.FontStyle]::Bold)
  $cyan = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(83, 232, 255))
  $graphics.DrawString("FLOWPILOT CRM", $brandFont, $cyan, 62 * $scale, 42 * $scale)
  $graphics.DrawString($item.Title, $titleFont, [System.Drawing.Brushes]::White, 60 * $scale, 82 * $scale)
  $image = [System.Drawing.Image]::FromFile((Join-Path $source $item.File))
  $graphics.DrawImage($image, [System.Drawing.RectangleF]::new(60 * $scale, 180 * $scale, 1480 * $scale, 638 * $scale))
  $image.Dispose()
  $graphics.DrawString($item.Label, $labelFont, $cyan, 64 * $scale, 842 * $scale)
  $brandFont.Dispose(); $titleFont.Dispose(); $labelFont.Dispose(); $cyan.Dispose()
  Save-Canvas $canvas $path
}

$items = @(
  @{ File = "01-landing-page.png"; Output = "02-premium-landing-page.png"; Title = "Premium product experience"; Label = "CLEAR LIVE DEMO ACCESS" },
  @{ File = "12-demo-role-login.png"; Output = "03-one-click-role-demos.png"; Title = "Explore every role in one click"; Label = "OWNER / ADMIN / MEMBER" },
  @{ File = "02-dashboard.png"; Output = "04-workspace-dashboard.png"; Title = "Your workspace at a glance"; Label = "PROJECTS / TASKS / CLIENTS" },
  @{ File = "04-project-details.png"; Output = "05-linked-project-delivery.png"; Title = "Keep delivery connected"; Label = "PROJECT DETAILS & TASKS" },
  @{ File = "05-crm-pipeline.png"; Output = "06-client-pipeline.png"; Title = "Move every opportunity forward"; Label = "LEAD / CONTACTED / WON / LOST" },
  @{ File = "06-client-details.png"; Output = "07-client-context.png"; Title = "See the complete client story"; Label = "NOTES / PROJECTS / ACTIVITY" },
  @{ File = "07-tasks-and-filters.png"; Output = "08-kanban-workflow.png"; Title = "Focus the team on what matters"; Label = "KANBAN / PRIORITIES / FILTERS" },
  @{ File = "08-analytics.png"; Output = "09-workspace-analytics.png"; Title = "Turn activity into clarity"; Label = "PIPELINE & DELIVERY ANALYTICS" },
  @{ File = "09-settings.png"; Output = "10-roles-and-workspace.png"; Title = "Built for real teams"; Label = "OWNER / ADMIN / MEMBER" }
)

Draw-Cover 400 225 (Join-Path $wideOutput "01-cover-flowpilot-crm.png") $false
Draw-Cover 1600 900 (Join-Path $masterOutput "01-cover-flowpilot-crm.png") $false
Draw-Cover 1080 1080 (Join-Path $squareOutput "FlowPilot-CRM-list-image-1080x1080.png") $true
foreach ($item in $items) {
  Draw-Feature $item 400 225 (Join-Path $wideOutput $item.Output)
  Draw-Feature $item 1600 900 (Join-Path $masterOutput $item.Output)
}
Write-Output "Marketplace media created in $output"
