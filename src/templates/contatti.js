import React from "react"
import { graphql } from "gatsby"
import { TextField, Button } from "@material-ui/core"
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

/* const TextFieldConError = ({ placeholder, ...props }) => {
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
} */

/* const onSubmit = (values) => {
  console.log("Grazie di avermi scelto per i tuoi regali")
  console.log(values);
} */

/* const validationSchema = yup.object({
  email: yup.string().email().required(),
  nome: yup.string().required(),
}) */
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

        <form
          data-netlify="true"
          className="contact-form"
          name="contact"
          form-name="contact-form"
          method="POST"
          action="/thanks"
        >
          <input name="contact-form" value="LaryArt form" type="hidden" />

          <div className="item">
            <TextField
              type="text"
              name="nome"
              placeholder="Nome"
              label="Nome"
              helperText="Nome richiesto"
              aria-label="Nome"
            />
          </div>
          <div className="item">
            <TextField
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
            <TextField
              aria-label="Cellulare"
              type="text"
              name="cellulare"
              as={TextField}
              placeholder="Cellulare"
            />
          </div>
          <div className="item">
            <TextField
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
              variant="contained"
              color="primary"
            >
              Invia
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Contact
