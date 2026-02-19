Dim shell
Set shell = CreateObject("WScript.Shell")

Dim batPath
batPath = "C:\Users\aldren.letada\Documents\workspace\website\ctu-admin-dashboard\launch_system.bat"

shell.Run "cmd.exe /c """ & batPath & """", 0, False

Set shell = Nothing
