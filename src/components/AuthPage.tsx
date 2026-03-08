import { useState } from 'react';
import { api, TokenManager, type User } from '../api';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (mode === 'register') {
        if (!username.trim()) {
          setError('请输入用户名');
          setLoading(false);
          return;
        }
        response = await api.register(email, password, username);
      } else {
        response = await api.login(email, password);
      }

      TokenManager.setToken(response.token);
      onLoginSuccess(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-primary)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '8px',
          color: 'var(--color-primary)'
        }}>
          拼豆豆
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          {mode === 'login' ? '登录你的账号' : '创建新账号'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--color-text)'
              }}>
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={mode === 'register'}
                placeholder="你的名字"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--color-text)'
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="至少6位"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee',
              color: '#c33',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--color-text-secondary)'
        }}>
          {mode === 'login' ? (
            <>
              还没有账号？
              <button
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                去登录
              </button>
            </>
          )}
        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #eee',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--color-text-secondary)'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            💡 提示：使用云端账号可以在多设备同步数据
          </p>
          <p style={{ margin: 0 }}>
            数据安全存储在你的服务器上
          </p>
        </div>
      </div>
    </div>
  );
}
