import React, { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "gatsby"
import { RiMenu3Line, RiCloseLine } from "react-icons/ri"

const MenuItems = [
  {
    path: "/",
    title: "Home",
  },
  {
    path: "/laryart",
    title: "Chi sono",
  },
  {
    path: "/blog",
    title: "Blog",
  },
  {
    path: "/contatti",
    title: "Contattami",
  },
]

const ListLink = props => (
  <li>
    <Link title="Menu" to={props.to}>{props.children}</Link>
  </li>
)

const Navigation = () => {
  const [showMenu, setShowMenu] = useState(false)
  const navRef = useRef(null)

  const closeMenu = useCallback(() => setShowMenu(false), [])

  useEffect(() => {
    const header = navRef.current?.closest(".site-header")
    if (!header) return
    const update = () => {
      header.style.setProperty("--header-height", header.offsetHeight + "px")
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (!showMenu) return

    const onKeyDown = event => {
      if (event.key === "Escape") closeMenu()
    }
    const onPointerDown = event => {
      if (navRef.current && !navRef.current.contains(event.target)) closeMenu()
    }
    const onResize = () => {
      if (window.matchMedia("(min-width: 992px)").matches) closeMenu()
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("resize", onResize)
    }
  }, [showMenu, closeMenu])

  const handleToggleClick = () => setShowMenu(prev => !prev)

  const listMenuItems = MenuItems.map((menuItem, index) => (
    <ListLink key={index} to={menuItem.path}>
      {menuItem.title}
    </ListLink>
  ))
  return (
    <nav className="site-navigation" ref={navRef}>
      <button
        onClick={handleToggleClick}
        aria-label="Apri menu di navigazione"
        aria-expanded={showMenu}
        aria-controls="site-menu"
        className={"menu-trigger" + (showMenu ? " is-active" : "")}
      >
        <div className="icon-menu-line">
          <RiMenu3Line />
        </div>
        <div className="icon-menu-close">
          <RiCloseLine />
        </div>
      </button>
      <ul id="site-menu" onClick={closeMenu}>
        {listMenuItems}
      </ul>
    </nav>
  )
}

export default Navigation
