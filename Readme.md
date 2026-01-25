Exe file export command:
```bash
cd backend
pyinstaller --noconfirm --onefile --windowed --add-data "../frontend/dist;frontend/dist"  main.py
```
