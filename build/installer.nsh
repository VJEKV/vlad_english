!macro customInstall
  ; Kill running instances
  nsExec::ExecToLog 'taskkill /f /im VladEnglish.exe'
  nsExec::ExecToLog 'taskkill /f /im VladEnglish2.exe'
  nsExec::ExecToLog 'taskkill /f /im electron.exe'

  ; Delete old app data
  RMDir /r "$APPDATA\vlad-english"
  RMDir /r "$APPDATA\VladEnglish"
  RMDir /r "$APPDATA\VladEnglish2"

  ; Delete old install (v1)
  RMDir /r "$LOCALAPPDATA\Programs\vlad-english"
  RMDir /r "$LOCALAPPDATA\vlad-english-updater"

  ; Delete old TTS cache
  RMDir /r "$APPDATA\vlad-english\tts-cache"
  RMDir /r "$APPDATA\VladEnglish2\tts-cache"
!macroend
