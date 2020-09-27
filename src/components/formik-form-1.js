import React from "react"
import { Formik, Form, Field, useField } from "formik"
import { TextField, Button } from "@material-ui/core"
import * as yup from "yup"

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
    />
  )
}

const onSubmit = values => {
  console.log("Grazie di avermi scelto per i tuoi regali")
  console.log(values)
}

const validationSchema = yup.object({
  email: yup.string().email().required(),
  nome: yup.string().required(),
})
const FormikContact = ({ data }) => {
  return (
    <Formik
      initialValues={{
        nome: "",
        email: "",
        cellulare: "",
        messaggio: "",
      }}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {({ values, errors, isSubmitting }) => (
        <Form
          data-netlify="true"
          className="contact-form"
          name="contact"
          form-name="contact-form"
          method="POST"
          action="/thanks"
        >
          <input name="contact-form" value="LaryAet form" type="hidden" />

          <div className="item">
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
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              color="primary"
            >
              Invia
            </Button>
          </div>
          {/* <pre>{JSON.stringify(values, null, 2)}</pre>
              <pre>{JSON.stringify(errors, null, 2)}</pre> */}
        </Form>
      )}
    </Formik>
  )
}

export default FormikContact
