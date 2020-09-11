import React from "react"
import { graphql } from "gatsby"
import { RiSendPlane2Line } from "react-icons/ri"
import { Formik } from "formik"

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
            messaggio: "",
            cellulare: "",
          }}
          validate={values => {
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
          }}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2))
              setSubmitting(false)
            }, 400)
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form
              className="contact-form"
              action="/thanks"
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="contatti" />
              <p>
                <label>
                  Il tuo nome *{" "}
                  <span className="red">
                    {errors.nome && touched.nome && errors.nome}
                  </span>
                  <input
                    type="text"
                    name="nome"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.nome}
                    placeholder="Il tuo nome"
                  />
                </label>
              </p>
              <p>
                <label>
                  La tua e-mail *{" "}
                  <span className="red">
                    {errors.email && touched.email && errors.email}
                  </span>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.email}
                    placeholder="La tua e-mail"
                  />
                </label>
              </p>
              <p>
                <label>
                  Il tuo cellulare
                  <input
                    type="text"
                    name="cellulare"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.cellulare}
                    placeholder="Il tuo cellulare"
                  />
                </label>
              </p>
              <p>
                <label>
                  Il motivo per cui mi contatti
                  <textarea
                    name="messaggio"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.messaggio}
                  ></textarea>
                </label>
              </p>
              <p className="text-align-right">
                <button
                  className="button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Invia
                  <span className="icon -right">
                    <RiSendPlane2Line />
                  </span>
                </button>
              </p>
            </form>
          )}
        </Formik>
      </div>
    </Layout>
  )
}

export default Contact
