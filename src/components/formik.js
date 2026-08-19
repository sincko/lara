import React from "react"
import { Formik, Form, Field, useField } from "formik"
import * as yup from "yup"
import emailjs from "emailjs-com"

//https://dashboard.emailjs.com/admin
emailjs.init("user_06xz85hi92oABMZqCIUu7")

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
        emailjs
          .sendForm("service_q3997uk", "template_m6tzcmm", "#contact_form")
          .then(result => {
            console.log(result.text, result.status)
          })
          .catch(error => {
            console.log(error.text)
            return
          })
        actions.resetForm()
        actions.setSubmitting(false)
        document.location.assign("/thanks")
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
            <button type="submit" className="submit">
              Invia
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default FormikContact
