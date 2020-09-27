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

const onSubmit = (values) => {
  console.log("Grazie di avermi scelto per i tuoi regali")
  console.log(values);
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
      </div>
    </Layout>
  )
}

export default Contact
