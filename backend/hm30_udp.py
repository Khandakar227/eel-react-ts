"""
SIYI HM30 UDP Communication Module
Provides UDP socket management for bidirectional communication with SIYI HM30 air unit.
"""

import socket
import threading
import time
from typing import Optional, Dict, Any, Tuple
from enum import Enum


class ConnectionStatus(Enum):
    """Connection status enumeration"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting"
    CONNECTED = "connected"
    ERROR = "error"


class HM30Connection:
    """
    Manages UDP connection to SIYI HM30 device.
    Supports bidirectional data transmission between ground and air units.
    """
    
    def __init__(self):
        self.socket: Optional[socket.socket] = None
        self.status = ConnectionStatus.DISCONNECTED
        self.remote_ip: Optional[str] = None
        self.remote_port: Optional[int] = None
        self.local_port: Optional[int] = None
        self.error_message: Optional[str] = None
        self.lock = threading.Lock()
        self.receive_buffer_size = 4096
        
    def connect(self, remote_ip: str, remote_port: int, local_port: Optional[int] = None) -> Dict[str, Any]:
        """
        Establish UDP connection to HM30 device.
        
        Args:
            remote_ip: IP address of the HM30 air unit
            remote_port: UDP port of the HM30 air unit
            local_port: Optional local port to bind to (auto-assigned if None)
            
        Returns:
            Dict with success status and message
        """
        with self.lock:
            try:
                # Close existing connection if any
                if self.socket:
                    self._close_socket()
                
                self.status = ConnectionStatus.CONNECTING
                self.error_message = None
                
                # Create UDP socket
                self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                self.socket.settimeout(5.0)  # 5 second timeout for operations
                
                # Bind to local port if specified
                if local_port:
                    self.socket.bind(('0.0.0.0', local_port))
                    self.local_port = local_port
                else:
                    self.socket.bind(('0.0.0.0', 0))  # Auto-assign port
                    self.local_port = self.socket.getsockname()[1]
                
                # Store remote endpoint
                self.remote_ip = remote_ip
                self.remote_port = remote_port
                
                # Send a test packet to verify connection
                test_message = b"HM30_CONNECT_TEST"
                self.socket.sendto(test_message, (remote_ip, remote_port))
                
                self.status = ConnectionStatus.CONNECTED
                
                return {
                    'success': True,
                    'message': f'Connected to {remote_ip}:{remote_port}',
                    'local_port': self.local_port
                }
                
            except socket.gaierror as e:
                self.status = ConnectionStatus.ERROR
                self.error_message = f"Invalid address: {str(e)}"
                return {
                    'success': False,
                    'error': self.error_message
                }
            except socket.timeout:
                self.status = ConnectionStatus.ERROR
                self.error_message = "Connection timeout"
                return {
                    'success': False,
                    'error': self.error_message
                }
            except Exception as e:
                self.status = ConnectionStatus.ERROR
                self.error_message = f"Connection failed: {str(e)}"
                return {
                    'success': False,
                    'error': self.error_message
                }
    
    def disconnect(self) -> Dict[str, Any]:
        """
        Close UDP connection.
        
        Returns:
            Dict with success status and message
        """
        with self.lock:
            try:
                if self.socket:
                    self._close_socket()
                
                self.status = ConnectionStatus.DISCONNECTED
                self.remote_ip = None
                self.remote_port = None
                self.local_port = None
                self.error_message = None
                
                return {
                    'success': True,
                    'message': 'Disconnected successfully'
                }
            except Exception as e:
                return {
                    'success': False,
                    'error': f"Disconnect error: {str(e)}"
                }
    
    def send_data(self, data: bytes) -> Dict[str, Any]:
        """
        Send data to HM30 air unit.
        
        Args:
            data: Bytes to send to air unit
            
        Returns:
            Dict with success status and bytes sent
        """
        with self.lock:
            if self.status != ConnectionStatus.CONNECTED:
                return {
                    'success': False,
                    'error': 'Not connected to HM30'
                }
            
            if not self.socket or not self.remote_ip or not self.remote_port:
                return {
                    'success': False,
                    'error': 'Invalid connection state'
                }
            
            try:
                bytes_sent = self.socket.sendto(data, (self.remote_ip, self.remote_port))
                return {
                    'success': True,
                    'bytes_sent': bytes_sent,
                    'message': f'Sent {bytes_sent} bytes to air unit'
                }
            except socket.timeout:
                return {
                    'success': False,
                    'error': 'Send timeout'
                }
            except Exception as e:
                self.status = ConnectionStatus.ERROR
                self.error_message = f"Send error: {str(e)}"
                return {
                    'success': False,
                    'error': self.error_message
                }
    
    def receive_data(self, timeout: float = 1.0) -> Dict[str, Any]:
        """
        Receive data from HM30 air unit.
        
        Args:
            timeout: Timeout in seconds for receive operation
            
        Returns:
            Dict with success status and received data
        """
        with self.lock:
            if self.status != ConnectionStatus.CONNECTED:
                return {
                    'success': False,
                    'error': 'Not connected to HM30'
                }
            
            if not self.socket:
                return {
                    'success': False,
                    'error': 'Invalid connection state'
                }
            
            try:
                # Temporarily set timeout for this operation
                original_timeout = self.socket.gettimeout()
                self.socket.settimeout(timeout)
                
                data, addr = self.socket.recvfrom(self.receive_buffer_size)
                
                # Restore original timeout
                self.socket.settimeout(original_timeout)
                
                return {
                    'success': True,
                    'data': data.decode('utf-8', errors='replace'),  # Try UTF-8 decode
                    'raw_data': data.hex(),  # Also provide hex representation
                    'bytes_received': len(data),
                    'source_ip': addr[0],
                    'source_port': addr[1]
                }
            except socket.timeout:
                # Restore original timeout
                if self.socket:
                    self.socket.settimeout(original_timeout)
                return {
                    'success': False,
                    'error': 'No data received (timeout)',
                    'timeout': True
                }
            except Exception as e:
                # Restore original timeout
                if self.socket:
                    self.socket.settimeout(original_timeout)
                return {
                    'success': False,
                    'error': f"Receive error: {str(e)}"
                }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current connection status.
        
        Returns:
            Dict with connection status information
        """
        with self.lock:
            return {
                'status': self.status.value,
                'connected': self.status == ConnectionStatus.CONNECTED,
                'remote_ip': self.remote_ip,
                'remote_port': self.remote_port,
                'local_port': self.local_port,
                'error_message': self.error_message
            }
    
    def _close_socket(self):
        """Internal method to close socket (assumes lock is held)"""
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
            finally:
                self.socket = None


# Global connection instance
_hm30_connection: Optional[HM30Connection] = None


def get_connection() -> HM30Connection:
    """Get or create the global HM30 connection instance"""
    global _hm30_connection
    if _hm30_connection is None:
        _hm30_connection = HM30Connection()
    return _hm30_connection
