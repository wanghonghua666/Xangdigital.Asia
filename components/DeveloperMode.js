"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "../app/Home.module.css"

export default function DeveloperMode() {
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password === "88888888") {
      setIsAuthenticated(true)
      setPassword("")
      setError("")
    } else {
      setError("密码错误")
      setTimeout(() => setError(""), 2000)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowModal(false)
      setPassword("")
      setError("")
      setIsAuthenticated(false)
    }
  }

  const buttonStyle = {
    padding: '0.8rem 1.2rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    fontWeight: '400',
    fontStretch: '0.8',
    color: 'white',
    transition: 'all 0.3s ease',
    margin: '0.5rem 0',
    width: '100%'
  }

  return (
    <>
      <div className="developer-mode">
        <button onClick={() => setShowModal(true)}>DEV</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex="-1">
          <div className="modal-content">
            {!isAuthenticated ? (
              <>
                <h3 className={styles.RedFont2}>开发者模式</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  {error && <div className="error">{error}</div>}
                  <div className="modal-buttons">
                    <button type="submit">验证</button>
                    <button type="button" onClick={() => setShowModal(false)}>
                      取消
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className={styles.RedFont2}>开发者工具</h3>
                <div className="dev-tools">
                  <button 
                    onClick={() => {
                      router.push('/admin')
                      setShowModal(false)
                    }}
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#4c6ef5'
                    }}
                  >
                    进入管理后台
                  </button>
                  
                  <button 
                    onClick={() => {
                      setShowModal(false)
                      setIsAuthenticated(false)
                    }}
                    style={{
                      ...buttonStyle,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      marginTop: '1rem'
                    }}
                  >
                    关闭
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .developer-mode {
          position: fixed;
          bottom: 10px;
          right: 10px;
          z-index: 1000;
        }

        .developer-mode button {
          background: none;
          border: none;
          color: #666;
          font-size: 10px;
          cursor: pointer;
          padding: 5px;
          opacity: 0.5;
          transition: opacity 0.3s ease;
          font-family: monospace;
          font-stretch: 0.8;
        }

        .developer-mode button:hover {
          opacity: 0.8;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }

        .modal-content {
          background: #1a1a1a;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 300px;
          max-width: 400px;
        }

        .modal-content h3 {
          margin-bottom: 1rem;
          text-align: center;
        }

        .modal-content input {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          font-family: monospace;
          font-stretch: 0.8;
          margin-bottom: 1rem;
          box-sizing: border-box;
        }

        .modal-content input:focus {
          outline: none;
          border-color: red;
        }

        .modal-content input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .error {
          color: red;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-family: monospace;
          font-stretch: 0.8;
          text-align: center;
        }

        .modal-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .modal-buttons button {
          flex: 1;
          padding: 0.8rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          font-stretch: 0.8;
          transition: background-color 0.3s ease;
          font-size: 0.8rem;
        }

        .modal-buttons button[type="submit"] {
          background: red;
          color: white;
        }

        .modal-buttons button[type="submit"]:hover {
          background: #cc0000;
        }

        .modal-buttons button[type="button"] {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .modal-buttons button[type="button"]:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .dev-tools {
          display: flex;
          flex-direction: column;
        }

        .dev-tools button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  )
} 