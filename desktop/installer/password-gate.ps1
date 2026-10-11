param([Parameter(Mandatory=$true)][string]$VerifierPath)
$ErrorActionPreference = 'Stop'
try {
    $verifier = Get-Content -LiteralPath $VerifierPath -Raw | ConvertFrom-Json
    if ($verifier.version -ne 1 -or $verifier.algorithm -ne 'pbkdf2-sha256' -or $verifier.iterations -ne 600000) { exit 1 }
    $salt = [Convert]::FromBase64String($verifier.salt)
    $expected = [Convert]::FromBase64String($verifier.hash)
    if ($salt.Length -ne 32 -or $expected.Length -ne 32) { exit 1 }
    Add-Type -AssemblyName System.Windows.Forms
    $form = New-Object System.Windows.Forms.Form
    $form.Text = 'Authorize PLS installation'
    $form.Width = 430
    $form.Height = 180
    $form.StartPosition = 'CenterScreen'
    $form.FormBorderStyle = 'FixedDialog'
    $form.MaximizeBox = $false
    $label = New-Object System.Windows.Forms.Label
    $label.Text = 'Enter the administrator installation password:'
    $label.SetBounds(15, 15, 390, 25)
    $password = New-Object System.Windows.Forms.TextBox
    $password.UseSystemPasswordChar = $true
    $password.MaxLength = 256
    $password.SetBounds(15, 45, 380, 25)
    $button = New-Object System.Windows.Forms.Button
    $button.Text = 'Authorize'
    $button.SetBounds(285, 85, 110, 30)
    $button.DialogResult = [System.Windows.Forms.DialogResult]::OK
    $form.AcceptButton = $button
    $form.Controls.AddRange(@($label, $password, $button))
    if ($form.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { exit 1 }
    $derive = [System.Security.Cryptography.Rfc2898DeriveBytes]::new(
        $password.Text, $salt, 600000, [System.Security.Cryptography.HashAlgorithmName]::SHA256)
    try { $actual = $derive.GetBytes(32) } finally { $derive.Dispose(); $password.Clear(); $form.Dispose() }
    $difference = 0
    for ($i = 0; $i -lt 32; $i++) { $difference = $difference -bor ($actual[$i] -bxor $expected[$i]) }
    [Array]::Clear($actual, 0, $actual.Length)
    if ($difference -ne 0) {
        [System.Windows.Forms.MessageBox]::Show('Incorrect password. PLS will not be installed.', 'Installation denied') | Out-Null
        exit 1
    }
    exit 0
} catch { exit 1 }
