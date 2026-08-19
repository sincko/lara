import React from "react"
import { Formik, Form, Field, useField } from "formik"
import * as yup from "yup"
import emailjs from "@emailjs/browser"

if (process.env.GATSBY_EMAILJS_PUBLIC_KEY) {
  emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })
}

const TextFieldConError = ({ placeholder, helperText, ...props }) => {
  const [field, meta] = useField(props)
  const hasError = !!(meta.error && meta.touched)
  return (
    <>
      <input
        {...field}
        {...props}
        placeholder={placeholder}
        className={hasError ? "input error" : "input"}
      />
      <p className={hasError ? "helper error" : "helper"}>{helperText}</p>
    </>
  )
}

const validationSchema = yup.object({
  email: yup.string().email().required(),
  nome: yup.string().required(),
})

const FormikContact = () => {
  return (
    <Formik
      initialValues={{
        nome: "",
        email: "",
        cellulare: "",
        messaggio: "",
      }}
      onSubmit={(values, actions) => {
        actions.setStatus({ sendError: false })
        return emailjs
          .sendForm(
            process.env.GATSBY_EMAILJS_SERVICE_ID,
            process.env.GATSBY_EMAILJS_TEMPLATE_ID,
            "#contact_form",
          )
          .then(result => {
            console.log(result.text, result.status)
            actions.resetForm()
            document.location.assign("/thanks")
          })
          .catch(error => {
            console.log(error.text)
            actions.setStatus({ sendError: true })
            actions.setSubmitting(false)
          })
      }}
      validationSchema={validationSchema}
    >
      {props => (
        <Form
          id="contact_form"
          data-netlify="true"
          className="contact_form"
          name="contact_form"
          form-name="contact_form"
          method="POST"
          action="/thanks"
          onSubmit={props.handleSubmit}
        >
          <p className="hidden">
            <label>
              Non compilare questo campo se sei un umano:{" "}
              <input name="bot-field" />
            </label>
          </p>

          <div className="item material">
            <TextFieldConError
              type="text"
              name="nome"
              placeholder="Nome"
              helperText="Nome richiesto"
              aria-label="Nome"
            />
          </div>
          <div className="item">
            <TextFieldConError
              type="text"
              name="email"
              placeholder="Email"
              aria-label="Email"
              helperText="Email richiesta"
            />
          </div>
          <div className="item">
            <Field
              aria-label="Cellulare"
              type="text"
              name="cellulare"
              placeholder="Cellulare"
            />
          </div>
          <div className="item">
            <Field
              as="textarea"
              rows="5"
              className="textarea"
              name="messaggio"
              aria-label="Scrivi qui il motivo per cui mi contatti"
              placeholder="Scrivi qui il motivo per cui mi contatti"
            />
          </div>
          <div className="item text-align-right">
            <button
              type="submit"
              className="submit"
              disabled={props.isSubmitting}
            >
              Invia
            </button>
          </div>
          {props.status && props.status.sendError && (
            <p className="send-error" role="alert">
              Si è verificato un errore nell'invio del messaggio. Riprova.
            </p>
          )}
        </Form>
      )}
    </Formik>
  )
}

export default FormikContact
