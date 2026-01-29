import React, { useState, useEffect } from 'react';
import { Button, Input, Form, Card, Steps, message, Typography, Space } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { backendAuthService } from '../../services/backendAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.scss';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const AdminSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [codeVerifier, setCodeVerifier] = useState<string>('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    // Check if we're returning from Spotify OAuth
    const code = searchParams.get('code');
    const storedVerifier = localStorage.getItem('admin_code_verifier');

    if (code && storedVerifier) {
      setCodeVerifier(storedVerifier);
      setCurrentStep(1);
    }
  }, [searchParams]);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const response = await backendAuthService.getAdminOAuthUrl();
      const { authUrl, codeVerifier } = response.data;

      // Store code verifier for later
      localStorage.setItem('admin_code_verifier', codeVerifier);

      // Redirect to Spotify OAuth
      window.location.href = authUrl;
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to start setup');
      setLoading(false);
    }
  };

  const handleCompleteSetup = async (values: { password: string; confirmPassword: string }) => {
    const code = searchParams.get('code');

    if (!code || !codeVerifier) {
      message.error('Missing OAuth code or verifier');
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    if (values.password.length < 8) {
      message.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await backendAuthService.completeAdminSetup({
        code,
        codeVerifier,
        sitePassword: values.password,
      });

      // Clean up stored verifier
      localStorage.removeItem('admin_code_verifier');

      message.success('Admin setup completed successfully!');
      setCurrentStep(2);

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to complete setup');
      setLoading(false);
    }
  };

  return (
    <div className='auth-container'>
      <Card className='auth-card' style={{ maxWidth: 600, width: '100%' }}>
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Admin Setup</Title>
            <Paragraph>
              Set up your Spotify React Web Client with multi-tier authentication
            </Paragraph>
          </div>

          <Steps current={currentStep}>
            <Step title='Spotify Login' description='Connect your Spotify account' />
            <Step title='Set Password' description='Create site password' />
            <Step title='Complete' description='Setup finished' />
          </Steps>

          {currentStep === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Paragraph>
                As the server owner, you need to authenticate with your Spotify account first. This
                will allow guests to use your Spotify account through password-protected access.
              </Paragraph>
              <Paragraph type='secondary'>
                <strong>Important:</strong> You need a Spotify Premium account for playback
                features to work.
              </Paragraph>
              <Button
                type='primary'
                size='large'
                onClick={handleStartSetup}
                loading={loading}
                icon={<LockOutlined />}
              >
                Connect with Spotify
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <Form form={form} onFinish={handleCompleteSetup} layout='vertical'>
              <Paragraph>
                Great! Your Spotify account is connected. Now set a password that guests will use to
                access the application.
              </Paragraph>

              <Form.Item
                name='password'
                label='Site Password'
                rules={[
                  { required: true, message: 'Please enter a password' },
                  { min: 8, message: 'Password must be at least 8 characters' },
                ]}
              >
                <Input.Password size='large' placeholder='Enter site password' />
              </Form.Item>

              <Form.Item
                name='confirmPassword'
                label='Confirm Password'
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password size='large' placeholder='Confirm site password' />
              </Form.Item>

              <Form.Item>
                <Button type='primary' htmlType='submit' size='large' block loading={loading}>
                  Complete Setup
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 2 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              <Title level={3} style={{ marginTop: 20 }}>
                Setup Complete!
              </Title>
              <Paragraph>
                Your Spotify React Web Client is now configured. Guests can now log in using the
                password you set.
              </Paragraph>
              <Paragraph type='secondary'>Redirecting to login page...</Paragraph>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default AdminSetup;
