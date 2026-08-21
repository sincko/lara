/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"

import Navigation from "./navigation"

describe("Navigation toggle", () => {
  it("flips the is-active class on the menu trigger when clicked", () => {
    render(<Navigation />)
    const trigger = screen.getByRole("button")

    // initial state: showMenu false → plain "menu-trigger" class
    expect(trigger.className).not.toContain("is-active")

    // first click: handleToggleClick flips showMenu → is-active appended
    fireEvent.click(trigger)
    expect(trigger.className).toContain("is-active")

    // second click: flips back
    fireEvent.click(trigger)
    expect(trigger.className).not.toContain("is-active")
  })

  it("closes the menu when a link is clicked", () => {
    render(<Navigation />)
    const trigger = screen.getByRole("button")

    fireEvent.click(trigger)
    expect(trigger.className).toContain("is-active")

    fireEvent.click(screen.getByText("Blog"))
    expect(trigger.className).not.toContain("is-active")
  })

  it("closes the menu on Escape", () => {
    render(<Navigation />)
    const trigger = screen.getByRole("button")

    fireEvent.click(trigger)
    expect(trigger.className).toContain("is-active")

    fireEvent.keyDown(document, { key: "Escape" })
    expect(trigger.className).not.toContain("is-active")
  })

  it("closes the menu when clicking outside the navigation", () => {
    render(<Navigation />)
    const trigger = screen.getByRole("button")

    fireEvent.click(trigger)
    expect(trigger.className).toContain("is-active")

    fireEvent.pointerDown(document.body)
    expect(trigger.className).not.toContain("is-active")
  })

  it("exposes the expanded state to assistive technology", () => {
    render(<Navigation />)
    const trigger = screen.getByRole("button")

    expect(trigger).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
  })
})
