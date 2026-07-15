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
  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="app-header__logo">뽀모도로 땅따먹기</div>
        <nav className="app-header__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                'app-header__nav-item' + (isActive ? ' app-header__nav-item--active' : '')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
