import eel
import os
import sys
from usb_devices import get_serial_devices, get_serial_device_count

def resource_path(*relative_path):
    """
    Get absolute path to resource.
    Works for dev and for PyInstaller.
    """
    if hasattr(sys, '_MEIPASS'):
        # Running from the bundled EXE
        return os.path.join(sys._MEIPASS, *relative_path)
    # Running from source
    # return os.path.join(os.path.dirname(__file__), *relative_path)
    return os.path.join(os.path.dirname(__file__), "..", *relative_path)

def close(page, sockets):
    print("Application is closing...")
    # Perform any necessary cleanup here
    sys.exit()
    os._exit(0)

# Expose Serial device functions to frontend
@eel.expose
def get_connected_usb_devices():
    """
    Get list of all connected serial devices/ports
    Returns: list of device dictionaries
    """
    try:
        devices = get_serial_devices()
        print("devices:", devices)
        return {
            'success': True,
            'devices': devices,
            'count': len(devices)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'devices': [],
            'count': 0
        }

@eel.expose
def get_usb_count():
    """
    Get count of connected serial devices/ports
    Returns: integer count
    """
    try:
        count = get_serial_device_count()
        return {
            'success': True,
            'count': count
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'count': 0
        }

web_dir = resource_path("frontend", "dist")
print(web_dir)
eel.init(web_dir)

try:
    eel.start("index.html", size=(1200, 600))
except:
    sys.exit()
    os._exit(0)
