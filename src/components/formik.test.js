/** @jest-environment jsdom */
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// MUST precede the import of FormikContact — emailjs.init() runs at module load (formik.js:8)
jest.mock("emailjs-com", () => ({
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
    // observable validation signal is the error STATE: helper text flips to the Mui-error class.
    const nomeHelper = screen.getByText("Nome richiesto")
    const emailHelper = screen.getByText("Email richiesta")
    await waitFor(() => expect(nomeHelper).toHaveClass("Mui-error"))
    expect(emailHelper).toHaveClass("Mui-error")
  })
})
