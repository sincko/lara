import React from "react"
import { Formik, Form, Field, useField } from "formik"
import { TextField, Button } from "@material-ui/core"
import * as yup from "yup"
import emailjs from "emailjs-com"

emailjs.init("user_06xz85hi92oABMZqCIUu7")

const TextFieldConError = ({ placeholder, ...props }) => {
  const [field, meta] = useField(props)
  const errorText = meta.error && meta.touched ? meta.error : ""
  return (
    <Field
      placeholder={placeholder}
      {...field}
      helperText={errorText}
      error={!!errorText}
      as={TextField}
      {...props}
    />
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
          .sendForm("service_q3997uk", "template_m6tzcmm", "contact_form")
          .then(() => {
            console.log("form spedito")
          })
          .catch(() => {
            console.log("Invio form fallito")
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
              label="Nome"
              helperText="Nome richiesto"
              aria-label="Nome"
            />
          </div>
          <div className="item">
            <TextFieldConError
              type="text"
              name="email"
              as={TextField}
              placeholder="Email"
              label="Email"
              aria-label="Email"
              helperText="Email richiesta"
            />
          </div>
          <div className="item">
            <Field
              aria-label="Cellulare"
              type="text"
              name="cellulare"
              as={TextField}
              placeholder="Cellulare"
            />
          </div>
          <div className="item">
            <Field
              type="text"
              name="messaggio"
              multiline
              rows="5"
              className="textarea"
              as={TextField}
              aria-label="Scrivi qui il motivo per cui mi contatti"
              placeholder="Scrivi qui il motivo per cui mi contatti"
            />
          </div>
          <div className="item text-align-right">
            <Button type="submit" variant="contained" color="primary">
              Invia
            </Button>
          </div>
          {/* <pre>{JSON.stringify(props.values, null, 2)}</pre>
          <pre>{JSON.stringify(props.errors, null, 2)}</pre> */}
        </Form>
      )}
    </Formik>
  )
}

export default FormikContact
