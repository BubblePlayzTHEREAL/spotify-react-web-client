import React from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { backendAuthService } from '../../services/backendAuth';
import { useNavigate } from 'react-router-dom';

interface LogoutButtonProps {
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  size?: 'small' | 'middle' | 'large';
  block?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ type = 'default', size = 'middle', block = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await backendAuthService.guestLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('guest_token');
      localStorage.removeItem('token_expires_at');
      
      // Redirect to login
      navigate('/login');
      window.location.reload();
    }
  };

  return (
    <Button type={type} size={size} block={block} icon={<LogoutOutlined />} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
