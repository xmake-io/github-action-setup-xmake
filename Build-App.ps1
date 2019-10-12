#!/usr/bin/env pwsh
Push-Location $PSScriptRoot

remove-item .\dist -Recurse -Force
tsc

Pop-Location