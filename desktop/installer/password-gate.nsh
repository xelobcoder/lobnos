!macro customInit
  IfSilent pls_install_denied
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /oname=pls-password-gate.ps1 "${PROJECT_DIR}\desktop\installer\password-gate.ps1"
  File /oname=pls-installer-verifier.json "${PROJECT_DIR}\.desktop-runtime\config\installer-verifier.json"
  nsExec::ExecToStack '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -STA -ExecutionPolicy Bypass -File "$PLUGINSDIR\pls-password-gate.ps1" -VerifierPath "$PLUGINSDIR\pls-installer-verifier.json"'
  Pop $0
  Pop $1
  Delete "$PLUGINSDIR\pls-password-gate.ps1"
  Delete "$PLUGINSDIR\pls-installer-verifier.json"
  StrCmp $0 "0" pls_install_authorized
  pls_install_denied:
    MessageBox MB_OK|MB_ICONSTOP "Installation authorization failed. PLS was not installed."
    SetErrorLevel 1
    Quit
  pls_install_authorized:
!macroend
