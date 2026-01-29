import React, { useState } from 'react';
import { Button, Input, Form, Card, message, Typography, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { backendAuthService } from '../../services/backendAuth';
import { useNavigate } from 'react-router-dom';
import './Auth.scss';

const { Title, Paragraph } = Typography;

const GuestLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values: { password: string }) => {
    setLoading(true);
    try {
      const response = await backendAuthService.guestLogin({ password: values.password });
      const { token, expiresAt } = response.data;

      // Store token in localStorage
      localStorage.setItem('guest_token', token);
      localStorage.setItem('token_expires_at', expiresAt);

      message.success('Login successful!');

      // Redirect to home page
      navigate('/');
      window.location.reload(); // Reload to trigger auth check
    } catch (error: any) {
      if (error.response?.status === 429) {
        message.error('Too many login attempts. Please try again later.');
      } else {
        message.error(error.response?.data?.error || 'Invalid password');
      }
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <Card className='auth-card' style={{ maxWidth: 400, width: '100%' }}>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <UserOutlined style={{ fontSize: 48, color: '#1db954' }} />
            <Title level={2} style={{ marginTop: 16 }}>
              Welcome
            </Title>
            <Paragraph>Enter the site password to access Spotify</Paragraph>
          </div>

          <Form form={form} onFinish={handleLogin} layout='vertical'>
            <Form.Item
              name='password'
              rules={[{ required: true, message: 'Please enter the password' }]}
            >
              <Input.Password
                size='large'
                prefix={<LockOutlined />}
                placeholder='Enter site password'
                autoFocus
              />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' size='large' block loading={loading}>
                Login
              </Button>
            </Form.Item>
          </Form>

          <Paragraph type='secondary' style={{ textAlign: 'center', fontSize: 12 }}>
            This site uses a shared Spotify account. Contact the administrator if you don't have
            the password.
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default GuestLogin;
