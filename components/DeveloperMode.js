"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeveloperMode() {
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === "88888888") {
      router.push("/admin")
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
    }
  }

  return (
    <>
      <div className="developer-mode">
        <button onClick={() => setShowModal(true)}>
          开发者模式
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onKeyDown={handleKeyDown} tabIndex={-1}>
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <h3>开发者模式</h3>
              <input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && <div className="error">{error}</div>}
              <div className="modal-buttons">
                <button type="submit">确认</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false)
                    setPassword("")
                    setError("")
                  }}
                >
                  取消
                </button>
              </div>
            </form>
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
        }

        .modal-content h3 {
          color: white;
          margin-bottom: 1rem;
          font-family: monospace;
        }

        .modal-content input {
          width: 100%;
          padding: 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: white;
          font-family: monospace;
          margin-bottom: 1rem;
        }

        .modal-content input:focus {
          outline: none;
          border-color: red;
        }

        .error {
          color: red;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-family: monospace;
        }

        .modal-buttons {
          display: flex;
          gap: 1rem;
        }

        .modal-buttons button {
          flex: 1;
          padding: 0.8rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          transition: background-color 0.3s ease;
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
      `}</style>
    </>
  )
} 