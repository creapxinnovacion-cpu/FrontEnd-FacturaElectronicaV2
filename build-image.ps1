# Script para compilar imagen Docker multi-arquitectura
# Proyecto: dte-frontend
# Versión: v.1.1.0.0

$IMAGE_NAME = "creapx/dte-frontend"
$TAG = "v.1.1.0.0"

Write-Host "Preparando entorno Buildx..."
docker buildx create --name multiarch-builder --use 2>$null
docker buildx inspect --bootstrap

Write-Host "Iniciando compilación para linux/amd64 y linux/arm64..."
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  -t "${IMAGE_NAME}:${TAG}" `
  -f "$PSScriptRoot/Dockerfile" "$PSScriptRoot" `
  --push

Write-Host "¡Proceso de compilación completado!"
