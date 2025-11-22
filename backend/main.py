import eel
import os
import sys

def resource_path(*relative_path):
    """
    Get absolute path to resource.
    Works for dev and for PyInstaller.
    """
    if hasattr(sys, '_MEIPASS'):
        # Running from the bundled EXE
        return os.path.join(sys._MEIPASS, *relative_path)
    # Running from source
    return os.path.join(os.path.dirname(__file__), *relative_path)

def close(page, sockets):
    print("Application is closing...")
    # Perform any necessary cleanup here
    sys.exit()
    os._exit(0)

web_dir = resource_path("frontend", "dist")
eel.init(web_dir)

try:
    eel.start("index.html", size=(1200, 600))
except:
    sys.exit()
    os._exit(0)
