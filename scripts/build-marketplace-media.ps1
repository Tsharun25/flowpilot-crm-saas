param(
  [string]$SourceDirectory = "marketplace-assets\screenshots",
  [string]$OutputDirectory = "..\Vibe96-Resubmission-FlowPilot-v1.5.5\02-Screenshots"
)

Add-Type -AssemblyName System.Drawing

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$source = [System.IO.Path]::GetFullPath((Join-Path $workspace $SourceDirectory))
$output = [System.IO.Path]::GetFullPath((Join-Path $workspace $OutputDirectory))
New-Item -ItemType Directory -Force $output | Out-Null

function New-RoundedRectanglePath([System.Drawing.RectangleF]$rect, [float]$radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $arc = [System.Drawing.RectangleF]::new($rect.X, $rect.Y, $diameter, $diameter)
  $path.AddArc($arc, 180, 90)
  $arc.X = $rect.Right - $diameter
  $path.AddArc($arc, 270, 90)
  $arc.Y = $rect.Bottom - $diameter
  $path.AddArc($arc, 0, 90)
  $arc.X = $rect.Left
  $path.AddArc($arc, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-Canvas {
  $bitmap = [System.Drawing.Bitmap]::new(1920, 1920)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  # Compose in the original 1080-unit design grid while rendering at the
  # marketplace-safe 1920×1920 output resolution.
  $graphics.ScaleTransform(1920 / 1080, 1920 / 1080)
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Canvas($canvas, [string]$path) {
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

$coverCanvas = New-Canvas
$coverImage = [System.Drawing.Image]::FromFile((Join-Path $workspace "public\product\cover-background.png"))
$coverCanvas.Graphics.DrawImage($coverImage, 0, 0, 1080, 1080)
$coverImage.Dispose()

$shade = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.Rectangle]::new(0, 0, 1080, 1080),
  [System.Drawing.Color]::FromArgb(235, 3, 8, 28),
  [System.Drawing.Color]::FromArgb(35, 3, 8, 28),
  0
)
$coverCanvas.Graphics.FillRectangle($shade, 0, 0, 1080, 1080)
$shade.Dispose()

$brandFont = [System.Drawing.Font]::new("Segoe UI", 26, [System.Drawing.FontStyle]::Bold)
$titleFont = [System.Drawing.Font]::new("Segoe UI", 70, [System.Drawing.FontStyle]::Bold)
$subtitleFont = [System.Drawing.Font]::new("Segoe UI", 28, [System.Drawing.FontStyle]::Regular)
$pillFont = [System.Drawing.Font]::new("Segoe UI", 17, [System.Drawing.FontStyle]::Bold)
$white = [System.Drawing.Brushes]::White
$cyan = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(83, 232, 255))
$muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(205, 222, 235))

$coverCanvas.Graphics.DrawString("FLOWPILOT", $brandFont, $cyan, 74, 74)
$coverCanvas.Graphics.DrawString("CRM", $titleFont, $white, 68, 126)
$coverCanvas.Graphics.DrawString("Clients. Projects. Delivery.", $subtitleFont, $muted, 74, 230)

$pills = @("CRM PIPELINE", "KANBAN TASKS", "LIVE ANALYTICS")
$pillX = 74
foreach ($pill in $pills) {
  $size = $coverCanvas.Graphics.MeasureString($pill, $pillFont)
  $rect = [System.Drawing.RectangleF]::new($pillX, 294, $size.Width + 38, 52)
  $path = New-RoundedRectanglePath $rect 18
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(42, 255, 255, 255))
  $coverCanvas.Graphics.FillPath($brush, $path)
  $coverCanvas.Graphics.DrawString($pill, $pillFont, $white, $pillX + 19, 307)
  $brush.Dispose(); $path.Dispose()
  $pillX += $size.Width + 54
}

$stackRect = [System.Drawing.RectangleF]::new(74, 930, 625, 76)
$stackPath = New-RoundedRectanglePath $stackRect 24
$stackBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(205, 6, 14, 38))
$coverCanvas.Graphics.FillPath($stackBrush, $stackPath)
$coverCanvas.Graphics.DrawString("NEXT.JS  /  PRISMA  /  MONGODB", $pillFont, $white, 102, 954)
$stackBrush.Dispose(); $stackPath.Dispose()
Save-Canvas $coverCanvas (Join-Path $output "01-cover-flowpilot-crm.png")

$brandFont.Dispose(); $titleFont.Dispose(); $subtitleFont.Dispose(); $pillFont.Dispose(); $cyan.Dispose(); $muted.Dispose()

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

$mediaTitleFont = [System.Drawing.Font]::new("Segoe UI", 38, [System.Drawing.FontStyle]::Bold)
$mediaBrandFont = [System.Drawing.Font]::new("Segoe UI", 19, [System.Drawing.FontStyle]::Bold)
$mediaLabelFont = [System.Drawing.Font]::new("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
$cyanBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(83, 232, 255))
$mutedBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(170, 190, 215))

foreach ($item in $items) {
  $canvas = New-Canvas
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(0, 0, 1080, 1080),
    [System.Drawing.Color]::FromArgb(5, 8, 20),
    [System.Drawing.Color]::FromArgb(13, 28, 62),
    45
  )
  $canvas.Graphics.FillRectangle($background, 0, 0, 1080, 1080)
  $background.Dispose()

  $canvas.Graphics.DrawString("FLOWPILOT CRM", $mediaBrandFont, $cyanBrush, 54, 47)
  $canvas.Graphics.DrawString($item.Title, $mediaTitleFont, [System.Drawing.Brushes]::White, 50, 92)

  $image = [System.Drawing.Image]::FromFile((Join-Path $source $item.File))
  $imageRect = [System.Drawing.RectangleF]::new(50, 190, 980, 551.25)
  $shadowPath = New-RoundedRectanglePath ([System.Drawing.RectangleF]::new(38, 178, 1004, 575.25)) 26
  $shadowBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(80, 0, 210, 255))
  $canvas.Graphics.FillPath($shadowBrush, $shadowPath)
  $canvas.Graphics.DrawImage($image, $imageRect)
  $image.Dispose(); $shadowBrush.Dispose(); $shadowPath.Dispose()

  $labelRect = [System.Drawing.RectangleF]::new(50, 800, 980, 112)
  $labelPath = New-RoundedRectanglePath $labelRect 28
  $labelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(32, 255, 255, 255))
  $canvas.Graphics.FillPath($labelBrush, $labelPath)
  $canvas.Graphics.DrawString($item.Label, $mediaLabelFont, $cyanBrush, 82, 842)
  $labelBrush.Dispose(); $labelPath.Dispose()

  $canvas.Graphics.DrawString("Self-hosted CRM & project management for focused client work", $mediaLabelFont, $mutedBrush, 54, 978)
  Save-Canvas $canvas (Join-Path $output $item.Output)
}

$mediaTitleFont.Dispose(); $mediaBrandFont.Dispose(); $mediaLabelFont.Dispose(); $cyanBrush.Dispose(); $mutedBrush.Dispose()
Write-Output "Marketplace media created in $output"
