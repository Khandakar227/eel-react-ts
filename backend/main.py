import eel
import os
import sys
from usb_devices import get_serial_devices, get_serial_device_count
from hm30_udp import get_connection

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

# Expose HM30 UDP functions to frontend
@eel.expose
def connect_hm30(remote_ip: str, remote_port: int, local_port: int = None):
    """
    Connect to HM30 device via UDP
    
    Args:
        remote_ip: IP address of HM30 air unit
        remote_port: UDP port of HM30 air unit
        local_port: Optional local port to bind to
        
    Returns:
        Dict with success status and connection info
    """
    try:
        conn = get_connection()
        return conn.connect(remote_ip, remote_port, local_port)
    except Exception as e:
        return {
            'success': False,
            'error': f'Connection error: {str(e)}'
        }

@eel.expose
def disconnect_hm30():
    """
    Disconnect from HM30 device
    
    Returns:
        Dict with success status
    """
    try:
        conn = get_connection()
        return conn.disconnect()
    except Exception as e:
        return {
            'success': False,
            'error': f'Disconnect error: {str(e)}'
        }

@eel.expose
def send_hm30_data(data: str, encoding: str = 'utf-8'):
    """
    Send data to HM30 air unit
    
    Args:
        data: String data to send
        encoding: Encoding to use (utf-8, hex, etc.)
        
    Returns:
        Dict with success status and bytes sent
    """
    try:
        conn = get_connection()
        
        # Convert string to bytes based on encoding
        if encoding == 'hex':
            # Remove spaces and convert hex string to bytes
            data_bytes = bytes.fromhex(data.replace(' ', ''))
        else:
            data_bytes = data.encode(encoding)
        
        return conn.send_data(data_bytes)
    except ValueError as e:
        return {
            'success': False,
            'error': f'Invalid data format: {str(e)}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Send error: {str(e)}'
        }

@eel.expose
def receive_hm30_data(timeout: float = 1.0):
    """
    Receive data from HM30 air unit
    
    Args:
        timeout: Timeout in seconds
        
    Returns:
        Dict with success status and received data
    """
    try:
        conn = get_connection()
        return conn.receive_data(timeout)
    except Exception as e:
        return {
            'success': False,
            'error': f'Receive error: {str(e)}'
        }

@eel.expose
def get_hm30_status():
    """
    Get HM30 connection status
    
    Returns:
        Dict with connection status info
    """
    try:
        conn = get_connection()
        return conn.get_status()
    except Exception as e:
        return {
            'success': False,
            'error': f'Status error: {str(e)}'
        }

web_dir = resource_path("frontend", "dist")
print(web_dir)
eel.init(web_dir)

try:
    eel.start("index.html", size=(1200, 600))
except:
    sys.exit()
    os._exit(0)
