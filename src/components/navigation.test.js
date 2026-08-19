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
})
