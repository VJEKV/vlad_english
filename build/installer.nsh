!macro customInstall
  ; Kill ALL old processes
  nsExec::ExecToLog 'taskkill /f /im VladEnglish.exe'
  nsExec::ExecToLog 'taskkill /f /im VladEnglish2.exe'
  nsExec::ExecToLog 'taskkill /f /im electron.exe'

  ; Delete ALL old app data
  RMDir /r "$APPDATA\vlad-english"
  RMDir /r "$APPDATA\VladEnglish"
  RMDir /r "$APPDATA\VladEnglish2"
  RMDir /r "$LOCALAPPDATA\vlad-english-updater"
  RMDir /r "$LOCALAPPDATA\VladEnglish-updater"

  ; Delete old v2 install
  RMDir /r "$LOCALAPPDATA\Programs\vlad-english2"
!macroend
