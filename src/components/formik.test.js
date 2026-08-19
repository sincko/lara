/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// MUST precede the import of FormikContact — emailjs.init() runs at module load (formik.js:8)
jest.mock("@emailjs/browser", () => ({
  init: jest.fn(),
  sendForm: jest.fn(),
}))
import FormikContact from "./formik"

describe("FormikContact validation", () => {
  it("surfaces yup validation errors for empty required fields through the UI", async () => {
    render(<FormikContact />)
    fireEvent.click(screen.getByRole("button", { name: "Invia" }))

    // Actual strings rendered in the first run: TextFieldConError spreads {...props} AFTER
    // helperText={errorText} (formik.js:20), so the static helperText props ("Nome richiesto" /
    // "Email richiesta") override the yup messages ("nome is a required field" etc.). The
    // observable validation signal is the error STATE: helper text flips to the error class.
    const nomeHelper = screen.getByText("Nome richiesto")
    const emailHelper = screen.getByText("Email richiesta")
    await waitFor(() => expect(nomeHelper).toHaveClass("error"))
    expect(emailHelper).toHaveClass("error")
  })
})

describe("submit failure path", () => {
  // FNDT-05 → FORM-04 regression net: unskip when Phase 4 fixes the false-success bug.
  // Fails on the current formik.js by design.
  it.skip("does NOT navigate to /thanks when emailjs.sendForm rejects — regression net for FORM-04", async () => {
    emailjs.sendForm.mockRejectedValue({ text: "network error" })
    // stub document.location.assign so jsdom doesn't actually navigate
    delete window.location
    Object.defineProperty(window, "location", {
      value: { assign: jest.fn() },
      writable: true,
    })
    const assign = window.location.assign

    render(<FormikContact />)
    fireEvent.change(screen.getByLabelText("Nome"), {
      target: { value: "Lara" },
    })
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "lara@example.com" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Invia" }))

    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1))
    // Current buggy code calls assign() unconditionally after the promise chain:
    expect(assign).not.toHaveBeenCalled() // FAILS today → regression net proves the bug; Phase 4 fixes it
  })
})
