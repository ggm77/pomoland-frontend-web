import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './AppHeader.css'

const NAV_ITEMS = [
  { to: '/timer', label: '타이머' },
  { to: '/map', label: '맵' },
  { to: '/stats', label: '통계' },
  { to: '/ranking', label: '랭킹' },
  { to: '/settings', label: '설정' },
]

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="app-header__logo">
          <img className="app-header__logo-icon" src="/logo2.svg" alt="" />
          <span>뽀모도로 땅따먹기</span>
        </div>
        <nav className={'app-header__nav' + (menuOpen ? ' app-header__nav--open' : '')}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                'app-header__nav-item' + (isActive ? ' app-header__nav-item--active' : '')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <button
        type="button"
        className="app-header__menu-btn"
        aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  )
}
