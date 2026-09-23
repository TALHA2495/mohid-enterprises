# TaskComplete Hook
# PowerShell template for Windows hook execution.

try {
    $rawInput = [Console]::In.ReadToEnd()
    if ($rawInput) {
        $null = $rawInput | ConvertFrom-Json
    }
} catch {
    Write-Error "[TaskComplete] Invalid JSON input: $($_.Exception.Message)"
}

# Function to recursively build a text-based directory tree
function Get-ProjectTree {
    param(
        [string]$Path = '.',
        [string]$Indent = '',
        [string[]]$Exclude = @('.git', 'node_modules', 'dist', 'build', 'bin', 'obj', '.vs')
    )
    
    $output = @()
    
    # Get items, sort directories first, then alphabetically
    $items = Get-ChildItem -Path $Path | 
             Where-Object { $Exclude -notcontains $_.Name } |
             Sort-Object PSIsContainer -Descending, Name
             
    $total = $items.Count
    $i = 0
    
    foreach ($item in $items) {
        $i++
        $isLast = $i -eq $total
        $marker = if ($isLast) { '└── ' } else { '├── ' }
        
        $output += $Indent + $marker + $item.Name
        
        if ($item.PSIsContainer) {
            $nextIndent = $Indent + (if ($isLast) { '    ' } else { '│   ' })
            $output += Get-ProjectTree -Path $item.FullName -Indent $nextIndent -Exclude $Exclude
        }
    }
    return $output
}

try {
    # Generate the tree structure
    $treeOutput = Get-ProjectTree
    
    # Format as Markdown
    $mdContent = "# Code Map Structure`n`n*(Auto-updated on task completion)*`n`n```text`n"
    $mdContent += ($treeOutput -join "`n")
    $mdContent += "`n````n"
    
    # Write to the file
    Set-Content -Path "codemapstructure.md" -Value $mdContent -Encoding UTF8
    
    $contextMsg = "Successfully updated codemapstructure.md with the latest file tree."
} catch {
    $contextMsg = "Failed to update codemapstructure.md: $($_.Exception.Message)"
}

# Return the required JSON payload
@{
    cancel = $false
    contextModification = $contextMsg
    errorMessage = ""
} | ConvertTo-Json -Compress