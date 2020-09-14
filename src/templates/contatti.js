import React from "react"
import { graphql } from "gatsby"
import { Formik, Form, Field, useField } from "formik"
import { TextField, Button } from "@material-ui/core"
import * as yup from "yup"
import Layout from "../components/layout"
import SEO from "../components/seo"

export const pageQuery = graphql`
  query ContactQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      excerpt(pruneLength: 140)
      frontmatter {
        title
      }
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`

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

const validationSchema = yup.object({
  email: yup.string().email().required(),
  nome: yup.string().required(),
})
const Contact = ({ data }) => {
  const { markdownRemark, site } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark

  return (
    <Layout className="contact-page">
      <SEO
        title={frontmatter.title}
        description={frontmatter.title + " " + site.siteMetadata.title}
      />
      <div className="wrapper">
        <h1>{frontmatter.title}</h1>
        <div
          className="description"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <Formik
          initialValues={{
            email: "",
            nome: "",
            cellulare: "",
            messaggio: "",
          }}
          validationSchema={validationSchema}
          /* validate={values => {
            const errors = {}
            if (!values.email) {
              errors.email = "Manca la tua e-mail"
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = "E-mail non corretta"
            }
            if (!values.nome) {
              errors.nome = "Manca il tuo nome"
            }
            return errors
          }} */
        >
          {({ values, errors, isSubmitting }) => (
            <Form
              className="contact-form"
              action="/thanks"
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
            >
              <p>
                <TextFieldConError
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  label="Nome"
                  helperText="Nome richiesto"
                  aria-label="Nome"
                />
              </p>
              <p>
                <TextFieldConError
                  aria-label="Email"
                  type="text"
                  name="email"
                  as={TextField}
                  placeholder="Email"
                  label="Email"
                  helperText="Email richiesta"
                />
              </p>
              <p>
                <Field
                  aria-label="Cellulare"
                  type="text"
                  name="cellulare"
                  as={TextField}
                  placeholder="Cellulare"
                />
              </p>
              <p>
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
              </p>
              <p className="text-align-right">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  color="primary"
                >
                  Invia
                </Button>
              </p>
              <pre>{JSON.stringify(values, null, 2)}</pre>
              <pre>{JSON.stringify(errors, null, 2)}</pre>
            </Form>
          )}
        </Formik>
      </div>
    </Layout>
  )
}

export default Contact
