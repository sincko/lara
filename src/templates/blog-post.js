import React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image"
import { RiArrowRightLine, RiArrowLeftLine } from "react-icons/ri"

import Layout from "../components/layout"
import Seo from "../components/seo"

const Pagination = props => (
  <div className="pagination -post">
    <ul>
      {props.previous &&
        props.previous.frontmatter.template === "blog-post" && (
          <li>
            <Link
              to={props.previous.frontmatter.slug}
              rel="prev"
              className="prev-next"
            >
              <p>
                <span className="icon -left">
                  <RiArrowLeftLine />
                </span>{" "}
                {props.previous.frontmatter.title}
              </p>
              {/* <span className="page-title">
              {props.previous.frontmatter.title}
            </span> */}
            </Link>
          </li>
        )}
      {props.next && props.next.frontmatter.template === "blog-post" && (
        <li>
          <Link
            to={props.next.frontmatter.slug}
            rel="next"
            className="prev-next"
          >
            <p>
              {props.next.frontmatter.title}
              <span className="icon -right">
                <RiArrowRightLine />
              </span>
            </p>
            {/* <span className="page-title">{props.next.frontmatter.title}</span> */}
          </Link>
        </li>
      )}
    </ul>
  </div>
)

const Post = ({ data, pageContext }) => {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html, excerpt } = markdownRemark
  const Image = getImage(frontmatter.featuredImage?.childImageSharp)
  const imageSrc = getSrc(frontmatter.featuredImage?.childImageSharp)
  const { previous, next } = pageContext

  let props = {
    previous,
    next,
  }

  return (
    <Layout className="page">
      <Seo
        title={frontmatter.title}
        description={
          frontmatter.description ? frontmatter.description : excerpt
        }
        image={imageSrc}
        article={true}
      />
      <article className="blog-post">
        <header className="featured-banner">
          <section className="article-header">
            <h1>{frontmatter.title}</h1>
            <time>{frontmatter.date}</time>
          </section>
          {Image ? (
            <GatsbyImage
              image={Image}
              objectFit="cover"
              objectPosition="50% 50%"
              alt={frontmatter.title + " - Featured image"}
              className="featured-image"
            />
          ) : (
            ""
          )}
        </header>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="blog-post-content">
          Non esitare a contattarmi tramite{" "}
          <a
            href="https://wa.me/393356785620"
            target="_blank"
            rel="noopener noreferrer"
          >
            whatsapp
          </a>{" "}
          o compilando il form contatti a{" "}
          <Link to="/contatti">questa pagina</Link>
        </div>
      </article>
      {(previous || next) && <Pagination {...props} />}
    </Layout>
  )
}

export default Post

export const pageQuery = graphql`
  query BlogPostQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
      html
      excerpt(pruneLength: 148)
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        slug
        title
        description
        featuredImage {
          childImageSharp {
            gatsbyImageData(
              layout: CONSTRAINED
              quality: 80
              breakpoints: [350, 700, 1050, 1400]
              placeholder: BLURRED
            )
          }
        }
      }
    }
  }
`
