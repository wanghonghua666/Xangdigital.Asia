"use client"

import { useEffect, useRef } from 'react'

export default function ShopifyBuyButton({ 
  productId, 
  variantId, 
  handle, 
  price, 
  currency = 'EUR',
  available = true,
  className = '',
  style = {}
}) {
  const buttonRef = useRef(null)

  useEffect(() => {
    // 动态加载Shopify Buy Button脚本
    const loadShopifyScript = () => {
      if (window.ShopifyBuy) {
        return Promise.resolve(window.ShopifyBuy)
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button.js'
        script.async = true
        script.onload = () => resolve(window.ShopifyBuy)
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const initializeBuyButton = async () => {
      try {
        const ShopifyBuy = await loadShopifyScript()
        
        if (!buttonRef.current) return

        // 清除现有内容
        buttonRef.current.innerHTML = ''

        // 创建Buy Button
        const client = ShopifyBuy.buildClient({
          domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'your-store.myshopify.com',
          storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || 'your-token'
        })

        const ui = ShopifyBuy.UI.init(client)

        ui.createComponent('product', {
          id: productId,
          node: buttonRef.current,
          options: {
            product: {
              iframe: false,
              contents: {
                img: false,
                imgWithCarousel: false,
                title: false,
                variantTitle: false,
                price: false,
                description: false,
                buttonWithQuantity: false,
                quantity: false
              },
              styles: {
                button: {
                  'background-color': '#000000',
                  'color': '#ffffff',
                  'border': '1px solid #000000',
                  'border-radius': '0px',
                  'font-family': 'monospace',
                  'font-size': '14px',
                  'font-weight': 'bold',
                  'text-transform': 'uppercase',
                  'letter-spacing': '1px',
                  'padding': '12px 24px',
                  'cursor': 'pointer',
                  'transition': 'all 0.3s ease'
                },
                buttonHover: {
                  'background-color': '#ffffff',
                  'color': '#000000'
                }
              }
            },
            cart: {
              iframe: false,
              popup: true,
              styles: {
                button: {
                  'background-color': '#000000',
                  'color': '#ffffff',
                  'border': '1px solid #000000',
                  'border-radius': '0px',
                  'font-family': 'monospace',
                  'font-size': '14px',
                  'font-weight': 'bold',
                  'text-transform': 'uppercase',
                  'letter-spacing': '1px',
                  'padding': '12px 24px'
                }
              }
            }
          }
        })
      } catch (error) {
        console.error('Shopify Buy Button初始化失败:', error)
        
        // 显示fallback按钮
        if (buttonRef.current) {
          buttonRef.current.innerHTML = `
            <button 
              style="
                background-color: #000000;
                color: #ffffff;
                border: 1px solid #000000;
                border-radius: 0px;
                font-family: monospace;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 12px 24px;
                cursor: pointer;
                transition: all 0.3s ease;
                ${available ? '' : 'opacity: 0.5; cursor: not-allowed;'}
              "
              ${available ? '' : 'disabled'}
              onclick="alert('Shopify集成未配置，请联系管理员')"
            >
              ${available ? `购买 - ${price}` : '暂时缺货'}
            </button>
          `
        }
      }
    }

    if (productId && available) {
      initializeBuyButton()
    } else if (buttonRef.current) {
      // 显示缺货状态
      buttonRef.current.innerHTML = `
        <button 
          style="
            background-color: #666666;
            color: #ffffff;
            border: 1px solid #666666;
            border-radius: 0px;
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px 24px;
            cursor: not-allowed;
            opacity: 0.5;
          "
          disabled
        >
          暂时缺货
        </button>
      `
    }

    return () => {
      if (buttonRef.current) {
        buttonRef.current.innerHTML = ''
      }
    }
  }, [productId, variantId, handle, price, currency, available])

  return (
    <div 
      ref={buttonRef} 
      className={className}
      style={style}
    />
  )
}

// 简化的购买按钮组件（用于商店列表）
export function SimpleBuyButton({ 
  productId, 
  price, 
  available = true,
  onClick,
  className = '',
  style = {}
}) {
  const handleClick = () => {
    if (available && onClick) {
      onClick()
    } else if (!available) {
      alert('此商品暂时缺货')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      style={{
        background: available ? '#000000' : '#666666',
        color: '#ffffff',
        border: `1px solid ${available ? '#000000' : '#666666'}`,
        borderRadius: '0px',
        fontFamily: 'monospace',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        padding: '8px 16px',
        cursor: available ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease',
        opacity: available ? 1 : 0.5,
        ...style
      }}
      disabled={!available}
    >
      {available ? `购买 - ${price}` : '缺货'}
    </button>
  )
} 