"""
Serial Device Detection Module
Provides functionality to detect and list connected serial devices/ports
"""

def get_serial_devices():
    """
    Get list of connected serial devices/ports
    Returns a list of dictionaries containing device information
    """
    try:
        import serial.tools.list_ports
        
        devices = []
        ports = serial.tools.list_ports.comports()
        
        for port in ports:
            device_info = {
                'port': port.device,
                'name': port.name if hasattr(port, 'name') else port.device,
                'description': port.description if port.description else "N/A",
                'manufacturer': port.manufacturer if port.manufacturer else "Unknown",
                'product': port.product if port.product else "N/A",
                'vid': f"0x{port.vid:04x}" if port.vid else "N/A",
                'pid': f"0x{port.pid:04x}" if port.pid else "N/A",
                'serial_number': port.serial_number if port.serial_number else "N/A",
                'location': port.location if hasattr(port, 'location') and port.location else "N/A",
                'hwid': port.hwid if port.hwid else "N/A",
            }
            devices.append(device_info)
        
        return devices
    except ImportError:
        print("pyserial not installed. Please run: pip install pyserial")
        return []
    except Exception as e:
        print(f"Error getting serial devices: {e}")
        return []

def get_serial_device_count():
    """
    Get the count of connected serial devices
    Returns: integer count
    """
    devices = get_serial_devices()
    return len(devices)

